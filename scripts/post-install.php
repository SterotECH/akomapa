<?php

declare(strict_types=1);

function project_path(string $path = ''): string
{
    $root = dirname(__DIR__);

    if ($path === '') {
        return $root;
    }

    return $root.DIRECTORY_SEPARATOR.str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $path);
}

function step(string $message): void
{
    echo PHP_EOL.'==> '.$message.PHP_EOL;
}

function run_command(string $command): void
{
    passthru($command, $exitCode);

    if ($exitCode !== 0) {
        throw new RuntimeException("Command failed with exit code {$exitCode}: {$command}");
    }
}

function command_exists(string $command): bool
{
    $checkCommand = PHP_OS_FAMILY === 'Windows'
        ? 'where '.escapeshellarg($command).' >NUL 2>NUL'
        : 'command -v '.escapeshellarg($command).' >/dev/null 2>&1';

    system($checkCommand, $exitCode);

    return $exitCode === 0;
}

function env_value(string $key, ?string $fallback = null): ?string
{
    $path = project_path('.env');

    if (! file_exists($path)) {
        return $fallback;
    }

    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

    if ($lines === false) {
        return $fallback;
    }

    foreach ($lines as $line) {
        if (str_starts_with(trim($line), '#')) {
            continue;
        }

        if (! str_starts_with($line, $key.'=')) {
            continue;
        }

        return trim(substr($line, strlen($key) + 1), "\"'");
    }

    return $fallback;
}

function set_env_value(string $key, string $value, bool $quote = true): void
{
    $path = project_path('.env');
    $line = $quote
        ? $key.'="'.str_replace('"', '\"', $value).'"'
        : $key.'='.$value;

    $content = file_get_contents($path);

    if ($content === false) {
        throw new RuntimeException('Unable to read .env file.');
    }

    $pattern = '/^#?\s*'.preg_quote($key, '/').'=.*$/m';

    if (preg_match($pattern, $content) === 1) {
        $content = preg_replace($pattern, $line, $content);
    } else {
        $content = rtrim($content).PHP_EOL.$line.PHP_EOL;
    }

    if ($content === null || file_put_contents($path, $content) === false) {
        throw new RuntimeException('Unable to write .env file.');
    }
}

chdir(project_path());

step('Preparing environment file');

if (! file_exists(project_path('.env'))) {
    copy(project_path('.env.example'), project_path('.env'));
}

$databasePath = env_value('DB_DATABASE', project_path('database/database.sqlite'));
$appUrl = getenv('AKOMAPA_APP_URL') ?: env_value('APP_URL', 'http://localhost');

set_env_value('APP_ENV', 'production');
set_env_value('APP_DEBUG', 'false', false);
set_env_value('APP_URL', $appUrl);
set_env_value('DB_CONNECTION', 'sqlite');
set_env_value('DB_DATABASE', $databasePath);
set_env_value('SESSION_DRIVER', 'database');
set_env_value('CACHE_STORE', 'database');
set_env_value('QUEUE_CONNECTION', 'database');

step('Installing and building frontend assets');

if (! command_exists('npm')) {
    throw new RuntimeException('Required command npm was not found in PATH.');
}

run_command('npm ci --include=dev');
run_command('npm run build');

step('Preparing SQLite database');

$databaseDirectory = dirname($databasePath);

if (! is_dir($databaseDirectory) && ! mkdir($databaseDirectory, 0755, true) && ! is_dir($databaseDirectory)) {
    throw new RuntimeException("Unable to create database directory: {$databaseDirectory}");
}

if (! file_exists($databasePath) && touch($databasePath) === false) {
    throw new RuntimeException("Unable to create database file: {$databasePath}");
}

step('Generating application key when needed');

if (env_value('APP_KEY', '') === '') {
    run_command(escapeshellarg(PHP_BINARY).' artisan key:generate --force --no-interaction');
}

step('Running database migrations');
run_command(escapeshellarg(PHP_BINARY).' artisan migrate --force --no-interaction');

step('Linking storage');
run_command(escapeshellarg(PHP_BINARY).' artisan storage:link --force --no-interaction');

step('Optimizing Laravel');
run_command(escapeshellarg(PHP_BINARY).' artisan optimize:clear --no-interaction');
run_command(escapeshellarg(PHP_BINARY).' artisan optimize --no-interaction');
run_command(escapeshellarg(PHP_BINARY).' artisan queue:restart --no-interaction');

step('Post-install deployment setup complete');
echo 'Point IIS or your web server document root to: '.project_path('public').PHP_EOL;

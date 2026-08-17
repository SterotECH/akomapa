<?php

namespace App\Http\Controllers;

use Symfony\Component\HttpFoundation\StreamedResponse;

class BackupController extends Controller
{
    public function download(): StreamedResponse
    {
        $dbPath = config('database.connections.sqlite.database');
        $dbName = basename($dbPath);
        $timestamp = now()->format('Y-m-d_H-i-s');
        $filename = "akomapa_backup_{$timestamp}.sqlite";

        return response()->streamDownload(function () use ($dbPath) {
            readfile($dbPath);
        }, $filename, [
            'Content-Type' => 'application/x-sqlite3',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }
}

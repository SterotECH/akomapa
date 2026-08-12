const ULID_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

export function createMockId(): string {
    let time = Date.now();
    let id = '';

    for (let index = 0; index < 10; index += 1) {
        id = ULID_ALPHABET[time % 32] + id;
        time = Math.floor(time / 32);
    }

    const random = new Uint8Array(16);

    if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) {
        crypto.getRandomValues(random);
    } else {
        for (let index = 0; index < random.length; index += 1) {
            random[index] = Math.floor(Math.random() * 256);
        }
    }

    for (const byte of random) {
        id += ULID_ALPHABET[byte % 32];
    }

    return id;
}

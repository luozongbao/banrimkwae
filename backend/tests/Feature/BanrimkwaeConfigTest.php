<?php

test('application name is correctly set', function () {
    expect(config('app.name'))->toBe('Banrimkwae Resort Management');
});

test('database connection is configured for testing', function () {
    // In testing environment, we use SQLite in memory for isolation
    // Production uses MariaDB with MySQL driver
    expect(config('database.default'))->toBe('sqlite');
    expect(config('database.connections.sqlite.database'))->toBe(':memory:');
});

test('production database is configured for mariadb', function () {
    // Verify MariaDB connection config exists (using MySQL driver)
    expect(config('database.connections.mysql'))->toHaveKey('host');
    expect(config('database.connections.mysql.port'))->toBe('3306'); // Port comes as string from env
    expect(config('database.connections.mysql.driver'))->toBe('mysql');
});

test('sanctum domains are configured', function () {
    expect(config('sanctum.stateful'))->toContain('localhost:3001');
});

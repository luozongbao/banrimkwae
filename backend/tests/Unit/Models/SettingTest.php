<?php

use App\Models\Setting;

it('can create a setting', function () {
    $setting = Setting::create([
        'key' => 'test.setting',
        'value' => 'test value',
        'type' => 'string',
        'category' => 'test',
    ]);

    expect($setting)->toBeInstanceOf(Setting::class);
    $this->assertDatabaseHas('settings', [
        'key' => 'test.setting',
        'value' => 'test value',
    ]);
});

it('can get setting value', function () {
    Setting::create([
        'key' => 'app.name',
        'value' => 'Test App',
        'type' => 'string',
    ]);

    expect(Setting::get('app.name'))->toBe('Test App');
    expect(Setting::get('nonexistent.key', 'Default'))->toBe('Default');
});

it('can set setting value', function () {
    Setting::set('test.boolean', true);
    
    expect(Setting::get('test.boolean'))->toBeTrue();
    
    $setting = Setting::where('key', 'test.boolean')->first();
    expect($setting->type)->toBe('boolean');
});

it('handles type casting', function () {
    Setting::set('test.integer', 42);
    Setting::set('test.boolean', true);
    Setting::set('test.float', 3.14);
    Setting::set('test.array', ['one', 'two', 'three']);

    expect(Setting::get('test.integer'))->toBeInt();
    expect(Setting::get('test.integer'))->toBe(42);
    
    expect(Setting::get('test.boolean'))->toBeBool();
    expect(Setting::get('test.boolean'))->toBeTrue();
    
    expect(Setting::get('test.float'))->toBeFloat();
    expect(Setting::get('test.float'))->toBe(3.14);
    
    expect(Setting::get('test.array'))->toBeArray();
    expect(Setting::get('test.array'))->toBe(['one', 'two', 'three']);
});

it('can get settings by category', function () {
    Setting::create(['key' => 'cat1.setting1', 'value' => 'value1', 'category' => 'cat1']);
    Setting::create(['key' => 'cat1.setting2', 'value' => 'value2', 'category' => 'cat1']);
    Setting::create(['key' => 'cat2.setting1', 'value' => 'value3', 'category' => 'cat2']);

    $cat1Settings = Setting::getByCategory('cat1');
    
    expect($cat1Settings)->toHaveCount(2);
    expect($cat1Settings['cat1.setting1'])->toBe('value1');
    expect($cat1Settings['cat1.setting2'])->toBe('value2');
});

it('can get public settings', function () {
    Setting::create(['key' => 'public.setting', 'value' => 'public value', 'is_public' => true]);
    Setting::create(['key' => 'private.setting', 'value' => 'private value', 'is_public' => false]);

    $publicSettings = Setting::getPublic();
    
    expect($publicSettings)->toHaveKey('public.setting');
    expect($publicSettings)->not->toHaveKey('private.setting');
    expect($publicSettings['public.setting'])->toBe('public value');
});

it('can get settings grouped by category', function () {
    Setting::create([
        'key' => 'app.name', 
        'value' => 'Test App', 
        'category' => 'app',
        'description' => 'Application name'
    ]);
    Setting::create([
        'key' => 'mail.driver', 
        'value' => 'smtp', 
        'category' => 'mail',
        'description' => 'Mail driver'
    ]);

    $grouped = Setting::getAllGrouped();
    
    expect($grouped)->toHaveKey('app');
    expect($grouped)->toHaveKey('mail');
    expect($grouped['app'])->toHaveKey('app.name');
    expect($grouped['app']['app.name']['value'])->toBe('Test App');
    expect($grouped['app']['app.name']['description'])->toBe('Application name');
});

it('has working scopes', function () {
    Setting::create(['key' => 'public1', 'is_public' => true, 'is_editable' => true, 'category' => 'cat1']);
    Setting::create(['key' => 'private1', 'is_public' => false, 'is_editable' => false, 'category' => 'cat2']);
    Setting::create(['key' => 'public2', 'is_public' => true, 'is_editable' => true, 'category' => 'cat1']);

    expect(Setting::public()->count())->toBe(2);
    expect(Setting::editable()->count())->toBe(2);
    expect(Setting::byCategory('cat1')->count())->toBe(2);
    expect(Setting::byCategory('cat2')->count())->toBe(1);
});

it('can get casted value', function () {
    $setting = Setting::create([
        'key' => 'test.boolean',
        'value' => 'true',
        'type' => 'boolean'
    ]);

    expect($setting->getCastedValue())->toBeTrue();
    expect($setting->getCastedValue())->toBeBool();
});

it('can set value with proper formatting', function () {
    $setting = Setting::create([
        'key' => 'test.number',
        'value' => '10',
        'type' => 'integer'
    ]);

    $setting->setValue(20);
    expect($setting->value)->toBe('20');
});

it('can infer types automatically', function () {
    Setting::set('auto.boolean', true);
    Setting::set('auto.integer', 42);
    Setting::set('auto.float', 3.14);
    Setting::set('auto.array', ['test']);
    Setting::set('auto.string', 'test');

    expect(Setting::where('key', 'auto.boolean')->first()->type)->toBe('boolean');
    expect(Setting::where('key', 'auto.integer')->first()->type)->toBe('integer');
    expect(Setting::where('key', 'auto.float')->first()->type)->toBe('float');
    expect(Setting::where('key', 'auto.array')->first()->type)->toBe('array');
    expect(Setting::where('key', 'auto.string')->first()->type)->toBe('string');
});

it('can validate values', function () {
    $setting = Setting::create([
        'key' => 'test.email',
        'value' => 'test@example.com',
        'type' => 'string',
        'validation_rules' => ['email']
    ]);

    expect($setting->validateValue('valid@email.com'))->toBeTrue();
    expect($setting->validateValue('invalid-email'))->toBeFalse();
});

it('orders settings correctly', function () {
    Setting::create(['key' => 'z.setting', 'sort_order' => 2]);
    Setting::create(['key' => 'a.setting', 'sort_order' => 1]);
    Setting::create(['key' => 'b.setting', 'sort_order' => 1]);

    $ordered = Setting::ordered()->pluck('key')->toArray();
    
    expect($ordered)->toBe(['a.setting', 'b.setting', 'z.setting']);
});

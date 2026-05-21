<?php

namespace App\Services;

use Illuminate\Database\Eloquent\Model;

class WhatsappService
{
    public static function makeLink(string $phone, string $message): string
    {
        $phone = preg_replace('/[^0-9]/', '', $phone);
        return 'https://wa.me/' . $phone . '?text=' . rawurlencode($message);
    }

    public static function interpolate(string $template, array $vars): string
    {
        foreach ($vars as $key => $value) {
            $template = str_replace('{{' . $key . '}}', (string) ($value ?? ''), $template);
        }
        return $template;
    }

    public static function varsFor(string $module, Model $subject): array
    {
        return match ($module) {
            'lead' => [
                'first_name' => $subject->contact?->first_name ?? '',
                'last_name'  => $subject->contact?->last_name  ?? '',
                'name'       => trim(($subject->contact?->first_name ?? '') . ' ' . ($subject->contact?->last_name ?? '')),
                'reference'  => $subject->reference ?? '',
                'budget'     => $subject->budget_max ? 'RWF ' . number_format((int) $subject->budget_max) : '',
                'phone'      => $subject->contact?->phone ?? '',
            ],
            'contact' => [
                'first_name' => $subject->first_name ?? '',
                'last_name'  => $subject->last_name  ?? '',
                'name'       => trim(($subject->first_name ?? '') . ' ' . ($subject->last_name ?? '')),
                'email'      => $subject->email ?? '',
                'phone'      => $subject->phone ?? '',
            ],
            'deal' => [
                'name'      => $subject->title ?? '',
                'title'     => $subject->title ?? '',
                'reference' => $subject->reference ?? '',
                'value'     => $subject->value ? 'RWF ' . number_format((int) $subject->value) : '',
            ],
            'tenancy' => [
                'reference'  => $subject->reference ?? '',
                'property'   => $subject->property?->title ?? '',
                'start_date' => $subject->start_date?->format('d M Y') ?? '',
                'end_date'   => $subject->end_date?->format('d M Y')   ?? '',
            ],
            default => [],
        };
    }
}

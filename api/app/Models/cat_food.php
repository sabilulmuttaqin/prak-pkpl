<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Casts\Attribute;

class cat_food extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_name',
        'image',
        'description',
        'stock',
        'price',
    ];

    protected function image(): Attribute
    {
        return Attribute::make(
            get: fn($image) => url('/storage/cat_foods/' . $image),
        );
    }
}

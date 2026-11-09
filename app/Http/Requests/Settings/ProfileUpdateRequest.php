<?php

namespace App\Http\Requests\Settings;

use App\Concerns\ProfileValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ProfileUpdateRequest extends FormRequest
{
    use ProfileValidationRules;

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            ...$this->profileRules($this->user()->id),
            // Birthday shows in every space you're in; you decide if age is shown.
            // วันเกิดจะแสดงในทุก space ที่คุณอยู่ และเลือกได้ว่าจะโชว์อายุไหม
            'birthday' => ['nullable', 'date_format:Y-m-d', 'before:today', 'after:1900-01-01'],
            'show_age' => ['boolean'],
        ];
    }
}

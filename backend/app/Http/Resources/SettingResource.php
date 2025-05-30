<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SettingResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'key' => $this->key,
            'value' => $this->getCastedValue(),
            'raw_value' => $this->value,
            'type' => $this->type,
            'category' => $this->category,
            'group' => $this->group,
            'description' => $this->description,
            'is_public' => $this->is_public,
            'is_editable' => $this->is_editable,
            'validation_rules' => $this->validation_rules,
            'sort_order' => $this->sort_order,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}

<?php

namespace App\Http\Controllers\Api\Work;

use App\Http\Controllers\Controller;
use App\Models\Devices;
use Illuminate\Http\Request;

class DeviceController extends Controller
{
    public function createOrNotExit(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'endpoint' => 'required',
            ]);
            $user_id = auth()->user()->id;
            $device = Devices::where('user_id', $user_id)->first();
            $endpoint = $request->input('endpoint');
            if ($device) {
                $device->update(['endpoint' => json_encode($endpoint)]);
                return response()->json([
                    'message' => 'Device updated successfully',
                    'error' => false,
                    'data' => $device
                ], 200);
            }
            $newDevice = Devices::create([
                'user_id' => $user_id,
                'endpoint' => json_encode($endpoint)
            ]);

            return response()->json([
                'message' => 'Device created successfully',
                'error' => false,
                'data' => $newDevice
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'error' => true,
                'data' => null
            ], 400);
        }
    }
}

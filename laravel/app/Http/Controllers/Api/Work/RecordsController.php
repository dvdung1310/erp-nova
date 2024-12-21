<?php

namespace App\Http\Controllers\Api\Work;

use App\Http\Controllers\Controller;
use App\Models\CrmDepartmentModel;
use App\Models\CrmEmployeeLevelModel;
use App\Models\CrmEmployeeModel;
use App\Models\Records;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class RecordsController extends Controller
{
    protected mixed $nodeUrl;
    protected mixed $ClientUrl;

    public function __construct()
    {
        $this->nodeUrl = env('NODE_URL');
        $this->ClientUrl = env('CLIENT_URL');
    }

    public function create(Request $request)
    {
        try {
            $validator = $request->validate([
                'record_date' => 'required',
                'user_id' => 'required', // id cua nhan vien
                'record_level' => 'required',
                'file' => 'nullable|file|mimes:jpeg,png,pdf,doc,docx|max:2048',
            ]);
            $record_sender_id = auth()->user()->id;
            $validator['record_sender_id'] = $record_sender_id;
            if ($request->hasFile('file')) {
                $filePath = $request->file('file')->store('records', 'public');
            }
            $record = Records::create([
                'record_date' => $validator['record_date'],
                'user_id' => $validator['user_id'],
                'record_file' => $filePath ?? null,
                'record_level' => $validator['record_level'],
                'record_sender_id' => $validator['record_sender_id']
            ]);
            return response()->json([
                'message' => 'Record created successfully',
                'error' => false,
                'data' => $record
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'error' => true,
                'data' => null
            ], 500);
        }
    }

    public function getRecordByUserId()
    {
        try {
            $user_id = auth()->user()->id;
            $employee = CrmEmployeeModel::where('account_id', $user_id)->first();
            $canCreateRecord = false;
            $canDeleteRecord = false;
            if ($employee->department_id == 1 || $employee->department_id == 9) {
                $canCreateRecord = true;
                $canDeleteRecord = true;
            }
            $records = Records::where('user_id', $user_id)
                ->orWhere('record_sender_id', $user_id)
                ->with(['employee', 'recordSender'])
                ->get();
            if ($records->isEmpty()) {
                return response()->json([
                    'message' => 'No records found',
                    'error' => false,
                    'data' => [
                        'records' => [],
                        'canCreateRecord' => $canCreateRecord,
                        'canDeleteRecord' => $canDeleteRecord
                    ]
                ], 200);
            }
            return response()->json([
                'message' => 'Records fetched successfully',
                'error' => false,
                'data' => [
                    'records' => $records,
                    'canCreateRecord' => $canCreateRecord,
                    'canDeleteRecord' => $canDeleteRecord
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'error' => true,
                'data' => null
            ], 500);
        }

    }

    public function delete($record_id)
    {
        try {
            $record = Records::find($record_id);
            if (!$record) {
                return response()->json([
                    'message' => 'Record not found',
                    'error' => true,
                    'data' => null
                ], 404);
            }
            $user_id = auth()->user()->id;
            $employee = CrmEmployeeModel::where('account_id', $user_id)->first();
            if ($employee->department_id != 1 && $employee->department_id != 9) {
                return response()->json([
                    'message' => 'You do not have permission to delete this record',
                    'error' => true,
                    'data' => null
                ], 403);
            }
            if ($record->record_file) {
                Storage::disk('public')->delete($record->record_file);
            }
            $record->delete();
            return response()->json([
                'message' => 'Record deleted successfully',
                'error' => false,
                'data' => null
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'error' => true,
                'data' => null
            ], 500);
        }
    }

    public function getRecordById($record_id)
    {
        try {
            $record = Records::find($record_id);
            if (!$record) {
                return response()->json([
                    'message' => 'Record not found',
                    'error' => true,
                    'data' => null
                ], 404);
            }
            $employee = CrmEmployeeModel::where('account_id', $record->user_id)->first();
            $department_name = CrmDepartmentModel::where('department_id', $employee->department_id)->pluck('department_name')->first();
            $level_name = CrmEmployeeLevelModel::where('level_id', $employee->level_id)->pluck('level_name')->first();
            $record->employee = $employee;
            $record->employee->department_name = $department_name;
            $record->employee->level_name = $level_name;
            return response()->json([
                'message' => 'Record fetched successfully',
                'error' => false,
                'data' => $record
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'error' => true,
                'data' => null
            ], 500);
        }

    }

    public function updateRecordUserConfirm($record_id)
    {
        try {
            $record = Records::find($record_id);
            if (!$record) {
                return response()->json([
                    'message' => 'Record not found',
                    'error' => true,
                    'data' => null
                ], 404);
            }
            $recordSenderConfirm = $record->record_sender_confirm;
            if ($recordSenderConfirm == 1) {
                $record->record_status = 1;
            }
            $record->record_user_confirm = 1;
            $record->save();
            return response()->json([
                'message' => 'Record updated successfully',
                'error' => false,
                'data' => $record
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'error' => true,
                'data' => null
            ], 500);
        }

    }

    public function updateRecordSenderConfirm($record_id)
    {
        try {
            $record = Records::find($record_id);
            if (!$record) {
                return response()->json([
                    'message' => 'Record not found',
                    'error' => true,
                    'data' => null
                ], 404);
            }
            $recordUserConfirm = $record->record_user_confirm;
            if ($recordUserConfirm == 1) {
                $record->record_status = 1;
            }
            $record->record_sender_confirm = 1;
            $record->save();
            return response()->json([
                'message' => 'Record updated successfully',
                'error' => false,
                'data' => $record
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'error' => true,
                'data' => null
            ], 500);
        }

    }
}


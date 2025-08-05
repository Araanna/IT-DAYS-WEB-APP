<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AttendanceController extends Controller
{
    // For attendee to log their attendance (AM-IN, PM-OUT, etc.)
    public function logTime(Request $request)
    {
        $request->validate([
            'type' => 'required|in:am_in,am_out,pm_in,pm_out',
        ]);

        $attendee = Auth::user();
        $today = now()->toDateString();

        $attendance = Attendance::firstOrCreate([
            'attendee_id' => $attendee->id,
            'date' => $today,
        ]);

        $attendance->{$request->type} = now()->format('H:i:s');
        $attendance->save();

        return response()->json(['message' => 'Attendance logged successfully.']);
    }

    // For SBO to view all attendance with attendee names
    public function index()
    {
        $records = Attendance::with('attendee')->latest()->get();
        return response()->json($records);
    }
}

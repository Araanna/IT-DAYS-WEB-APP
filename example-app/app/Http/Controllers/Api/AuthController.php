<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|unique:attendees,email',
            'password' => 'required|string|confirmed|min:6',
            'course' => 'required|string',
            'gender' => 'required|in:Male,Female,Other',
            'year_level_id' => 'required|exists:year_levels,id',
            'role' => 'required|in:Attendee,SBO',
            'position' => 'nullable|string|required_if:role,SBO',
        ]);

        $attendee = Attendee::create([
            'full_name' => $request->full_name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'course' => $request->course,
            'gender' => $request->gender,
            'year_level_id' => $request->year_level_id,
            'role' => $request->role,
            'position' => $request->role === 'SBO' ? $request->position : null,
        ]);

        // Generate QR code
        $qrDirectory = 'qr_codes';
        $qrFileName = 'qr_' . $attendee->id . '.png';
        $qrCodePath = $qrDirectory . '/' . $qrFileName;

        // Ensure directory exists in public storage
        if (!Storage::disk('public')->exists($qrDirectory)) {
            Storage::disk('public')->makeDirectory($qrDirectory);
        }

        // Generate and save QR code
        try {
            QrCode::format('png')
                ->size(300)
                ->generate($attendee->id, storage_path('app/public/' . $qrCodePath));

            $attendee->qr_code_path = $qrCodePath;
            $attendee->save();
        } catch (\Exception $e) {
            Log::error('QR Code generation failed: ' . $e->getMessage());
            return response()->json([
                'message' => 'Registration successful but QR code generation failed',
                'attendee' => $attendee,
                'qr_generated' => false
            ], 201);
        }

        return response()->json([
            'message' => 'Registration successful!',
            'attendee' => $attendee,
            'qr_code_url' => asset('storage/' . $qrCodePath),
            'qr_generated' => true
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = Attendee::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The credentials are incorrect.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'token' => $token,
            'user' => $user->only(['id', 'full_name', 'email', 'role', 'qr_code_path']),
            'qr_code_url' => $user->qr_code_path ? asset('storage/' . $user->qr_code_path) : null
        ]);
    }

    public function me(Request $request)
    {
        $user = $request->user()->load('yearLevel');

        return response()->json([
            'id' => $user->id,
            'full_name' => $user->full_name,
            'email' => $user->email,
            'course' => $user->course,
            'gender' => $user->gender,
            'year_level' => $user->yearLevel->label ?? null,
            'qr_code_path' => $user->qr_code_path,
            'qr_code_url' => $user->qr_code_path ? asset('storage/' . $user->qr_code_path) : null,
            'role' => $user->role,
            'position' => $user->position,
            'has_attended_today' => $user->has_attended_today,
        ]);
    }

    public function showQr($id, Request $request)
    {
        $authUser = $request->user();

        if ($authUser->role === 'Attendee' && $authUser->id != $id) {
            return response()->json(['message' => 'Unauthorized to view this QR code.'], 403);
        }

        $attendee = Attendee::with('yearLevel')->findOrFail($id);

        return response()->json([
            'qr_code_path' => $attendee->qr_code_path,
            'qr_code_url' => $attendee->qr_code_path ? asset('storage/' . $attendee->qr_code_path) : null,
            'full_name' => $attendee->full_name,
            'email' => $attendee->email,
            'course' => $attendee->course,
            'year_level' => $attendee->yearLevel->label ?? null,
            'has_attended_today' => $attendee->has_attended_today,
        ]);
    }

    public function showMyQr(Request $request)
    {
        $user = $request->user();
        return response()->json([
            'qr_code_path' => $user->qr_code_path,
            'qr_code_url' => $user->qr_code_path ? asset('storage/' . $user->qr_code_path) : null,
            'full_name' => $user->full_name
        ]);
    }

    public function attendeesList(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'SBO') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $attendees = Attendee::with('yearLevel')
            ->where('role', 'Attendee')
            ->get()
            ->map(function ($attendee) {
                return [
                    'id' => $attendee->id,
                    'full_name' => $attendee->full_name,
                    'email' => $attendee->email,
                    'course' => $attendee->course,
                    'gender' => $attendee->gender,
                    'year_level' => $attendee->yearLevel->label ?? null,
                    'qr_code_path' => $attendee->qr_code_path,
                    'qr_code_url' => $attendee->qr_code_path ? asset('storage/' . $attendee->qr_code_path) : null,
                    'has_attended' => $attendee->has_attended,
                ];
            });

        return response()->json($attendees);
    }

    public function scan($id, Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'SBO') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $attendee = Attendee::findOrFail($id);

        if ($attendee->has_attended) {
            return response()->json([
                'message' => 'Already marked as attended.',
                'attendee' => $attendee
            ]);
        }

        $attendee->has_attended = true;
        $attendee->save();

        return response()->json([
            'message' => 'Attendance marked successfully.',
            'attendee' => $attendee
        ]);
    }

    public function scanQr(Request $request, $id)
    {
        return $this->scan($id, $request);
    }
}

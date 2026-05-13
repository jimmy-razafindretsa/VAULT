<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Credential;

class CredentialController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->query('search');

        $credentials = $request->user()->credentials()
            ->when($search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('url', 'like', "%{$search}%");
            })
            ->latest()
            ->get()
            ->makeVisible(['password', 'notes']); // Need to make visible since we hid them by default for general serialization

        return inertia('dashboard', [
            'credentials' => $credentials,
            'filters' => $request->only('search'),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'url' => 'nullable|string|max:255',
            'account_id' => 'nullable|string|max:255',
            'password' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        $request->user()->credentials()->create($validated);

        return back();
    }

    public function update(Request $request, Credential $credential)
    {
        if ($credential->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'url' => 'nullable|string|max:255',
            'account_id' => 'nullable|string|max:255',
            'password' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        $credential->update($validated);

        return back();
    }

    public function destroy(Request $request, Credential $credential)
    {
        if ($credential->user_id !== $request->user()->id) {
            abort(403);
        }

        $credential->delete();

        return back();
    }
}

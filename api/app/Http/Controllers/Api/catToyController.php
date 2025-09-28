<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\cat_toy;
use Illuminate\Http\Request;
use App\Http\Resources\catToyResource;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class catToyController extends Controller
{
    public function index()
    {
        //get all posts 
        $posts = cat_toy::latest()->paginate(5);

        //return collection of posts as a resource 
        return new catToyResource(true, 'List Data Cat Toys', $posts);
    }
    public function store(Request $request)
    {
        //define validation rules 
        $validator = Validator::make($request->all(), [
            'product_name'     => 'required',
            'image'     => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'description'   => 'required',
            'stock'   => 'required',
            'price'   => 'required',
        ]);

        //check if validation fails 
        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        //upload image 
        $image = $request->file('image');
        $image->storeAs('public/cat_toys', $image->hashName());

        //create post 
        $post = cat_toy::create([
            'product_name' => $request->product_name,
            'image'     => $image->hashName(),
            'description' => $request->description,
            'stock'     => $request->stock,
            'price'     => $request->price,
        ]);
        //return response 
        return new catToyResource(true, 'Data Cat Toys Berhasil Ditambahkan!', $post);
    }
    public function show($id)
    {
        //find post by ID 
        $post = cat_toy::find($id);

        //return single post as a resource 
        return new catToyResource(true, 'Detail Data Post!', $post);
    }
    public function update(Request $request, $id)
    {
        //define validation rules
        $validator = Validator::make($request->all(), [
            'product_name'     => 'required',
            'stock'   => 'required',
            'price'   => 'required',
            'description'   => 'required',

        ]);

        //check if validation fails
        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        //find post by ID
        $post = cat_toy::find($id);

        //check if image is not empty
        if ($request->hasFile('image')) {

            //upload image
            $image = $request->file('image');
            $image->storeAs('public/cat_toys', $image->hashName());

            //delete old image
            Storage::delete('public/cat_toys/' . basename($post->image));

            //update post with new image
            $post->update([
                'product_name'     => $request->product_name,
                'image'     => $image->hashName(),
                'stock'   => $request->stock,
                'price'   => $request->price,
                'description'   => $request->description,
            ]);
        } else {

            //update post without image
            $post->update([
                'product_name'     => $request->product_name,
                'stock'   => $request->stock,
                'price'   => $request->price,
                'description'   => $request->description,
            ]);
        }

        //return response
        return new catToyResource(true, 'Data Cat Toys Berhasil Diubah!', $post);
    }
    public function destroy($id)
    {

        //find post by ID
        $post = cat_toy::find($id);

        //delete image
        Storage::delete('public/cat_toys/' . basename($post->image));

        //delete post
        $post->delete();

        //return response
        return new catToyResource(true, 'Data Cat Toys Berhasil Dihapus!', null);
    }
}

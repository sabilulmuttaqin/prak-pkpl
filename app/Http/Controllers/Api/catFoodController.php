<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\cat_food;
use App\Http\Resources\catFoodResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class catFoodController extends Controller
{
    public function index()
    {
        //get all posts
        $posts = cat_food::latest()->paginate(5);

        //return collection of posts as a resource
        return new catFoodResource(true, 'List Data Cat Food', $posts);
    }


    public function store(Request $request)
    {
        //define validation rules
        $validator = Validator::make($request->all(), [
            'product_name'     => 'required',
            'image'     => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'description' => 'required|min:20|max:200',
            'stock'   => 'required',
            'price'   => 'required',
        ]);


        //check if validation fails
        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        //upload image
        $image = $request->file('image');
        $image->storeAs('public/cat_foods', $image->hashName());

        //create post
        $post = cat_food::create([
            'product_name' => $request->product_name,
            'image'     => $image->hashName(),
            'description' => $request->description,
            'stock'     => $request->stock,
            'price'     => $request->price,
        ]);
        //return response
        return new catFoodResource(true, 'Data Cat Food Berhasil Ditambahkan!', $post);
    }


    public function show($id)
    {
        //find post by ID
        $post = cat_food::find($id);

        //return single post as a resource
        return new catFoodResource(true, 'Detail Data Post!', $post);
    }
    public function update(Request $request, $id)
    {
        //define validation rules
        $validator = Validator::make($request->all(), [
            'product_name'     => 'required',
            'stock'   => 'required',
            'price'   => 'required',
            'description' => 'required|min:20|max:200',
        ]);

        //check if validation fails
        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        //find post by ID
        $post = cat_food::find($id);

        //check if image is not empty
        if ($request->hasFile('image')) {

            //upload image
            $image = $request->file('image');
            $image->storeAs('public/cat_foods', $image->hashName());

            //delete old image
            Storage::delete('public/cat_foods/' . basename($post->image));

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
        return new catFoodResource(true, 'Data Cat Food Berhasil Diubah!', $post);
    }
    public function destroy($id)
    {

        //find post by ID
        $post = cat_food::find($id);

        //delete image
        Storage::delete('public/cat_foods/' . basename($post->image));

        //delete post
        $post->delete();

        //return response
        return new catFoodResource(true, 'Data Cat Food Berhasil Dihapus!', null);
    }
}

<?php

namespace App\Http\Controllers\Api;

//import model Post
use App\Models\Post;

use Illuminate\Http\Request;

//import resource PostResource
use App\Http\Controllers\Controller;
use App\Http\Resources\TransaksiResource;
use App\Models\Transaksi;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class TransaksiController extends Controller
{
    /**
     * index
     *
     * @return void
     */
    public function index()
    {
        //get all posts
        $posts = Transaksi::latest()->paginate(5);

        //return collection of posts as a resource
        return new TransaksiResource(true, 'List Data Transaksi', $posts);
    }

    /**
     * store
     *
     * @param  mixed $request
     * @return void
     */
    public function store(Request $request)
    {
        //define validation rules
        $validator = Validator::make($request->all(), [
            'id_transaksi'     => 'required',
            'nama'   => 'required',
            'alamat'   => 'required',
            'no_telp'  => 'required',
            'daftar_barang'  => 'required',
            'total'  => 'required',
            'bukti_transfer'     => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'validate'  => 'required',
        ]);

        //check if validation fails
        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        //upload image
        $image = $request->file('bukti_transfer');
        $image->storeAs('public/bukti_transfer', $image->hashName());

        //create post
        $post = Transaksi::create([
            'id_transaksi'     => $request->id_transaksi,
            'nama'   => $request->nama,
            'alamat'   => $request->alamat,
            'no_telp'  => $request->no_telp,
            'daftar_barang'  => $request->daftar_barang,
            'total'  => $request->total,
            'bukti_transfer'     => $image->hashName(),
            'validate'  => $request->validate,
        ]);

        //return response
        return new TransaksiResource(true, 'Data Transaksi Berhasil Ditambahkan!', $post);
    }

    /**
     * show
     *
     * @param  mixed $id
     * @return void
     */
    public function show($id)
    {
        //find post by ID
        $post = Transaksi::find($id);

        //return single post as a resource
        return new TransaksiResource(true, 'Detail Data Transaksi!', $post);
    }

    /**
     * update
     *
     * @param  mixed $request
     * @param  mixed $id
     * @return void
     */
    public function update(Request $request, $id)
    {
        //define validation rules
        $validator = Validator::make($request->all(), [
            'nama'     => 'required',
            'alamat'   => 'required',
            'no_telp'  => 'required',
            'daftar_barang'  => 'required',
            'total'  => 'required',
            'bukti_transfer'     => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'validate'  => 'required',
        ]);

        //check if validation fails
        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        //find post by ID
        $post = Transaksi::find($id);

        //check if image is not empty
        if ($request->hasFile('bukti_transfer')) {

            //upload image
            $image = $request->file('bukti_transfer');
            $image->storeAs('public/bukti_transfer', $image->hashName());

            //delete old image
            Storage::delete('public/bukti_transfer/' . basename($post->bukti_transfer));

            //update post with new image
            $post->update([
                'nama'     => $request->nama,
                'alamat'   => $request->alamat,
                'no_telp'  => $request->no_telp,
                'daftar_barang'  => $request->daftar_barang,
                'total'  => $request->total,
                'bukti_transfer'     => $image->hashName(),
                'validate'  => $request->validate,
            ]);
        } else {

            //update post without image
            $post->update([
                'title'     => $request->title,
                'content'   => $request->content,
            ]);
        }

        //return response
        return new TransaksiResource(true, 'Data Transaksi Berhasil Diubah!', $post);
    }

    public function updateStatus($id, Request $request)
    {
        $data = $request->validate([
            'validate' => 'required|in:approved,rejected,not yet'
        ]);

        $trx = Transaksi::findOrFail($id);
        $trx->validate = $data['validate'];
        $trx->save();

        return response()->json([
            'success' => true,
            'message' => 'Status updated',
            'data' => $trx
        ]);
    }

    public function destroy($id)
    {
        $trx = Transaksi::findOrFail($id);
        $trx->delete();

        return response()->json([
            'success' => true,
            'message' => 'Deleted'
        ]);
    }
}

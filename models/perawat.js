const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const perawatSchema = new Schema({
    userId: {
        required: true,
        type: String
    },
    namaLengkap: {
        required: true,
        type: String,
    },
    nik: {
        required: true,
        type: String,
    },
    tempatLahir: {
        required: true,
        type: String,
    },
    tanggalLahir: {
        required: true,
        type: String
    },
    pendidikan: {
        required: true,
        type: String
    },

    namaSekolah: {
        required: true,
        type: String
    },
    agama: {
        required: true,
        type: String
    },
    jenisKelamin: {
        required: true,
        type: String
    },
    beratBadan: {
        required: true,
        type: String
    },
    tinggiBadan: {
        required: true,
        type: String
    },
    alamat: {
        required: true,
        type: String
    },
    nomorTelepon: {
        required: true,
        type: String
    },
    email: {
        required: true,
        type: String
    },
    medsos: {
        required: true,
        type: String
    },
    namaOrtu: {
        required: true,
        type: String
    },
    alamatOrtu: {
        required: true,
        type: String
    },
    nomorOrtu: {
        required: true,
        type: String
    },

    // Pengalaman Berkerja
    namaInstansi: {
        required: true,
        type: String
    },
    alamatInstansi: {
        required: true,
        type: String
    },
    lamaBerkerja: {
        required: true,
        type: String
    },
    deskripsiPerkerjaan: {
        required: true,
        type: String
    },

    // Pengalaman Kerja
    jenisPelatihan: {
        required: true,
        type: String
    },
    namaLembaga: {
        required: true,
        type: String
    },
    noSertifikat: {
        required: true,
        type: String
    },
    tanggalSertifikat: {
        required: true,
        type: String
    },
    masaBerlakuSertifikat: {
        required: true,
        type: String
    }
})
const Perawat = mongoose.model('perawat', perawatSchema);
module.exports = Perawat;
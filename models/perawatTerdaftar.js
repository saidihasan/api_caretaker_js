const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const perawatTerdaftarSchema = new Schema({
    userId: {
        required: true,
        type: String
    },
    namaLengkap: {
        required: true,
        type: String,
    },
    kategori: {
        required: true,
        type: String
    },
    jenisKelamin: {
        required: true,
        type: String
    },
    agama: {
        required: true,
        type: String
    },
    tempatAsal: {
        required: true,
        type: String
    },
    tinggiBadan: {
        required: true,
        type: String
    },
    beratBadan: {
        required: true,
        type: String
    },
    pendidikanTerakhir: {
        required: true,
        type: String
    },
    namaSekolah: {
        type: String
    },
    deskripsiPengalaman: {
        required: true,
        type: String
    },
    fotoPasien: {
        required: true,
        type: String
    }
})
const PerawatTerdaftar = mongoose.model('perawatterdaftar', perawatTerdaftarSchema);
module.exports = PerawatTerdaftar;
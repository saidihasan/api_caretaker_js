const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const penggunaSchema = new Schema({
    userId: {
        required: true,
        type: String
    },
    namaPengguna: {
        required: true,
        type: String
    },
    nikPengguna: {
        required: true,
        type: String
    },
    tempatLahirPengguna: {
        required: true,
        type: String
    },
    tanggalLahirPengguna: {
        required: true,
        type: String
    },
    alamatPengguna: {
        required: true,
        type: String
    },
    noHpPengguna: {
        required: true,
        type: String
    },
    emailPengguna: {
        required: true,
        type: String
    },

    /**
     * Data pasien
     * 
     */

    namaLengkapPasien: {
        required: true,
        type: String
    },
    hubunganPasien: {
        required: true,
        type: String
    },
    jenisKelaminPasien: {
        required: true,
        type: String
    },
    tanggalLahirPasien: {
        required: true,
        type: String
    },
    alamatPasien: {
        required: true,
        type: String
    },
    agamaPasien: {
        required: true,
        type: String
    },
    kontakPasien: {
        required: true,
        type: String
    },

    /**
     * 
     * Kondisi Pasien
     */

    beratPasien: {
        required: true,
        type: String
    },
    tinggiPasien: {
        required: true,
        type: String
    },
    penyakitPasien: {
        required: true,
        type: String
    },
    obatRutinPasien: {
        required: true,
        type: String
    },
    namaRsPasien: {
        required: true,
        type: String
    },
    lukaPasien: {
        required: true,
        type: String
    },
    namaAlatPasien: {
        required: true,
        type: String
    },
    alasanDietPasien: {
        required: true,
        type: String
    },
    alergiObatPasien: {
        required: true,
        type: String
    },
    riwayatMedisPasien: {
        required: true,
        type: String
    },
    jumlahAsistenPasien: {
        required: true,
        type: String
    },
    jumlahHewanPasien: {
        required: true,
        type: String
    }
})
const Pengguna = mongoose.model('pengguna', penggunaSchema);
module.exports = Pengguna;
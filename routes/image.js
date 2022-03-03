const express = require('express');
const imageRouter = express.Router();
const mongoose = require('mongoose');
const Image = require('../models/image');
const Pengguna = require('../models/pengguna')
const Perawat = require('../models/perawat')
const ServerInvoice = require('../models/invoice')
const PerawatTerdaftar = require('../models/perawatTerdaftar')
const Xendit = require('xendit-node');

const x = new Xendit({
    secretKey: 'xnd_development_GPeglgOqrYOibrDsHEViO0JJoRmIJGtMGKsO6bpGDv3LD5Ww1NB4qZIvFaq6Pml',
});


module.exports = (upload) => {
    const url = process.env.DB;
    const connect = mongoose.createConnection(url, { useNewUrlParser: true, useUnifiedTopology: true });

    let gfs;

    connect.once('open', () => {
        // initialize stream
        gfs = new mongoose.mongo.GridFSBucket(connect.db, {
            bucketName: "uploads"
        });
    });

    /*
        POST: Upload a single image/file to Image collection
    */
    imageRouter.route('/upload/image')
        .post(upload.single('file'), (req, res, next) => {
            console.log(req.body);
            // check for existing images
            Image.findOne({ userId: req.body.userId })
                .then((image) => {
                    console.log(image);
                    if (image) {
                        return res.status(200).json({
                            success: false,
                            message: 'Image already exists',
                        });
                    }

                    let newImage = new Image({
                        caption: req.body.caption,
                        filename: req.file.filename,
                        fileId: req.file.id,
                        userId: req.body.userId
                    });

                    newImage.save()
                        .then((image) => {

                            res.status(200).json({
                                success: true,
                                image,
                            });
                        })
                        .catch(err => res.status(500).json(err));
                })
                .catch(err => res.status(500).json(err));
        })
        .get((req, res, next) => {
            Image.find({})
                .then(images => {
                    res.status(200).json({
                        success: true,
                        images,
                    });
                })
                .catch(err => res.status(500).json(err));
        });

    /*
        GET: Delete an image from the collection
    */
    imageRouter.route('/delete/:id')
        .get((req, res, next) => {
            Image.findOne({ _id: req.params.id })
                .then((image) => {
                    if (image) {
                        Image.deleteOne({ _id: req.params.id })
                            .then(() => {
                                return res.status(200).json({
                                    success: true,
                                    message: `File with ID: ${req.params.id} deleted`,
                                });
                            })
                            .catch(err => { return res.status(500).json(err) });
                    } else {
                        res.status(200).json({
                            success: false,
                            message: `File with ID: ${req.params.id} not found`,
                        });
                    }
                })
                .catch(err => res.status(500).json(err));
        });

    /*
        GET: Fetch most recently added record
    */
    imageRouter.route('/recent')
        .get((req, res, next) => {
            Image.findOne({}, {}, { sort: { '_id': -1 } })
                .then((image) => {
                    res.status(200).json({
                        success: true,
                        image,
                    });
                })
                .catch(err => res.status(500).json(err));
        });

    /*
        POST: Upload multiple files upto 3
    */
    imageRouter.route('/multiple')
        .post(upload.array('file', 3), (req, res, next) => {
            res.status(200).json({
                success: true,
                message: `${req.files.length} files uploaded successfully`,
            });
        });

    /*
        GET: Fetches all the files in the uploads collection
    */
    imageRouter.route('/files')
        .get((req, res, next) => {
            gfs.find().toArray((err, files) => {
                if (!files || files.length === 0) {
                    return res.status(200).json({
                        success: false,
                        message: 'No files available'
                    });
                }

                files.map(file => {
                    if (file.contentType === 'image/jpeg' || file.contentType === 'image/png' || file.contentType === 'image/svg') {
                        file.isImage = true;
                    } else {
                        file.isImage = false;
                    }
                });

                res.status(200).json({
                    success: true,
                    files,
                });
            });
        });

    /*
        GET: Fetches a particular file by filename
    */
    imageRouter.route('/file/:filename')
        .get((req, res, next) => {
            gfs.find({ filename: req.params.filename }).toArray((err, files) => {
                if (!files[0] || files.length === 0) {
                    return res.status(200).json({
                        success: false,
                        message: 'No files available',
                    });
                }

                res.status(200).json({
                    success: true,
                    file: files[0],
                });
            });
        });

    /* 
        GET: Fetches a particular image and render on browser
    */
    imageRouter.route('/image/:filename')
        .get((req, res, next) => {
            gfs.find({ filename: req.params.filename }).toArray((err, files) => {
                if (!files[0] || files.length === 0) {
                    return res.status(200).json({
                        success: false,
                        message: 'No files available',
                    });
                }

                gfs.openDownloadStreamByName(req.params.filename).pipe(res);


                // if (files[0].contentType === 'image/jpeg' ||
                //     files[0].contentType === 'image/png' ||
                //     files[0].contentType === 'image/svg+xml' ||
                //     files[0].contentType === 'image/jpg') {
                //     // render image to browser
                //     gfs.openDownloadStreamByName(req.params.filename).pipe(res);
                // } else {
                //     res.status(404).json({
                //         err: 'Not an image',
                //     });
                // }
                console.log(err)
            });
        });

    /*
        DELETE: Delete a particular file by an ID
    */
    imageRouter.route('/file/del/:id')
        .post((req, res, next) => {
            console.log(req.params.id);
            gfs.delete(new mongoose.Types.ObjectId(req.params.id), (err, data) => {
                if (err) {
                    return res.status(404).json({ err: err });
                }

                res.status(200).json({
                    success: true,
                    message: `File with ID ${req.params.id} is deleted`,
                });
            });
        });

    /*
        POST: Insert one of the Pengguna
    */
    imageRouter.route('/user/pengguna')
        .post(async(req, res) => {
            Pengguna.findOne({ userId: req.body.userId })
                .then((user) => {
                    console.log(user)
                    if (user) {
                        return res.status(200).json({
                            success: false,
                            message: "User already created!",
                        })
                    }

                    let penggunaBaru = new Pengguna({
                        userId: req.body.userId,
                        namaPengguna: req.body.nama_pengguna,
                        nikPengguna: req.body.nik_pengguna,
                        tempatLahirPengguna: req.body.tempat_lahir_pengguna,
                        tanggalLahirPengguna: req.body.tanggal_lahir_pengguna,
                        alamatPengguna: req.body.alamat_pengguna,
                        noHpPengguna: req.body.no_hp_pengguna,
                        emailPengguna: req.body.email_pengguna,

                        namaLengkapPasien: req.body.nama_lengkap_pasien,
                        hubunganPasien: req.body.hubungan_pasien,
                        jenisKelaminPasien: req.body.jenis_kelamin_pasien,
                        tanggalLahirPasien: req.body.tanggal_lahir_pasien,
                        alamatPasien: req.body.alamat_pasien,
                        agamaPasien: req.body.agama_pasien,
                        kontakPasien: req.body.kontak_pasien,

                        beratPasien: req.body.berat_pasien,
                        tinggiPasien: req.body.tinggi_pasien,
                        penyakitPasien: req.body.penyakit_pasien,
                        obatRutinPasien: req.body.obat_rutin_pasien,
                        namaRsPasien: req.body.nama_rs_pasien,
                        lukaPasien: req.body.luka_pasien,
                        namaAlatPasien: req.body.nama_alat_pasien,
                        alasanDietPasien: req.body.alasan_diet_pasien,
                        alergiObatPasien: req.body.alergi_obat_pasien,
                        riwayatMedisPasien: req.body.riwayat_medis_pasien,
                        jumlahAsistenPasien: req.body.jumlah_asisten_pasien,
                        jumlahHewanPasien: req.body.jumlah_hewan_pasien
                    })

                    penggunaBaru.save()
                        .then((image) => {

                            res.status(200).json({
                                success: true,
                                image,
                            });
                        })
                        .catch(err => res.status(500).json(err));
                })
                .catch(err => res.status(500).json(err));
        });

    /**
     * GET: Pengguna 
     * 
     */
    imageRouter.route('/users/pengguna')
        .get(async(req, res) => {
            Pengguna.find({}, function(err, users) {
                if (err) {
                    console.log(err)
                } else {
                    res.send(users)
                }
            })
        })

    /**
     * 
     * GET: get one pengguna
     */

    imageRouter.route('/users/pengguna/:user_id')
        .get(async(req, res) => {
            var query = Pengguna.where({ userId: req.params.user_id })
            query.findOne((err, user) => {
                if (err || user == null) {
                    console.log(err)
                    return res.status(200).json({
                        success: false,
                        user: null
                    })
                } else {
                    return res.status(200).json({
                        success: true,
                        user: user
                    })
                }
            })
        })

    /*
         POST: Insert one of the Perawat
        */
    imageRouter.route('/user/perawat')
        .post(async(req, res) => {
            Perawat.findOne({ userId: req.body.userId })
                .then((user) => {
                    // console.log(user)
                    if (user) {
                        return res.status(200).json({
                            success: false,
                            message: "User already created!",
                        })
                    }

                    let perawatBaru = new Perawat({
                        userId: req.body.userId,
                        namaLengkap: req.body.nama_lengkap,
                        nik: req.body.nik,
                        tempatLahir: req.body.tempat_lahir,
                        tanggalLahir: req.body.tanggal_lahir,
                        pendidikan: req.body.pendidikan_terakhir,
                        namaSekolah: req.body.nama_sekolah,
                        agama: req.body.agama,
                        jenisKelamin: req.body.jenis_kelamin,
                        beratBadan: req.body.berat_badan,
                        tinggiBadan: req.body.tinggi_badan,
                        alamat: req.body.alamat,
                        nomorTelepon: req.body.nomor_telepon,
                        email: req.body.email,
                        medsos: req.body.medsos,
                        namaOrtu: req.body.nama_ortu,
                        alamatOrtu: req.body.alamat_ortu,
                        nomorOrtu: req.body.nomor_ortu,

                        // Pengalaman kerja
                        namaInstansi: req.body.nama_instansi,
                        alamatInstansi: req.body.alamat_instansi,
                        lamaBerkerja: req.body.lama_berkerja,
                        deskripsiPerkerjaan: req.body.deskripsi_perkerjaan,

                        // Pelatihan kerja
                        jenisPelatihan: req.body.jenis_pelatihan,
                        namaLembaga: req.body.nama_lembaga,
                        noSertifikat: req.body.no_sertifikat,
                        tanggalSertifikat: req.body.tanggal_sertifikat,
                        masaBerlakuSertifikat: req.body.masa_berlaku

                    })

                    perawatBaru.save()
                        .then((image) => {

                            res.status(200).json({
                                success: true,
                                image,
                            });
                        })
                        .catch(err => res.status(500).json(err));
                })
                .catch(err => res.status(500).json(err));
        });


    /**
     * GET: ALL Perawat 
     * 
     */
    // imageRouter.route('/users/perawat')
    //     .get(async(req, res) => {
    //         Perawat.find({}, function(err, users) {
    //             var userMap = {}

    //             users.forEach(function(user) {
    //                 userMap[user.id] = user
    //             })
    //             res.send(userMap)
    //         })
    //     })

    imageRouter.route('/users/perawat')
        .get(async(req, res) => {
            Perawat.find({}, function(err, users) {
                if (err) {
                    console.log(err)
                } else {
                    res.send(users)
                }
            })
        });

    /**
     * 
     * GET: get one Perawat
     */

    imageRouter.route('/users/perawat/:user_id')
        .get(async(req, res) => {
            var query = Perawat.where({ userId: req.params.user_id })
            query.findOne((err, user) => {
                if (err || user == null) {
                    console.log(err)
                    return res.status(200).json({
                        success: false,
                        user: null
                    })
                } else {
                    // res.json(user)
                    return res.status(200).json({
                        success: true,
                        user: user
                    })
                }
            })
        })


    /*
        POST: Insert Bulk of the Perawat Terdaftar 
    */
    imageRouter.route('/user/submit/perawat')
        .post(async(req, res) => {

            let object = Object(req.body.Sheet1)

            console.log(object.length)

            for (var i = 0; i < object.length; i++) {
                console.log(object[i].userId);

                let perawatTerdaftar = new PerawatTerdaftar({
                    userId: object[i].userId,
                    namaLengkap: object[i].nama_perawat,
                    kategori: object[i].kategori,
                    jenisKelamin: object[i].jenis_kelamin,
                    agama: object[i].agama,
                    tempatAsal: object[i].alamat,
                    tinggiBadan: object[i].tinggi,
                    beratBadan: object[i].berat,
                    pendidikanTerakhir: object[i].pendidikan,
                    namaSekolah: object[i].nama_sekolah,
                    deskripsiPengalaman: object[i].deskripsi_pengalaman,
                    fotoPasien: object[i].gambar
                })

                perawatTerdaftar.save()
                    .then((data) => {

                        res.status(200).json({
                            success: true,
                            data: data,
                        });
                    })
                    .catch(err => res.status(500).json(err));
            }
        });

    /**
     *  GET : All Perawat Terdaftar
     */
    imageRouter.route('/users/perawatterdaftar')
        .get(async(req, res) => {
            PerawatTerdaftar.find({}, function(err, users) {
                if (err) {
                    console.log(err)
                } else {
                    res.send(users)
                }
            })
        });


    /*
         POST: Insert one of the Perawat
        */
    imageRouter.route('/user/perawatterdaftar')
        .post(async(req, res) => {
            PerawatTerdaftar.findOne({ userId: req.body.userId })
                .then((user) => {
                    // console.log(user)
                    if (user) {
                        return res.status(200).json({
                            success: false,
                            message: "User already created!",
                        })
                    }

                    let perawatTerdaftar = new PerawatTerdaftar({
                        userId: object[i].userId,
                        namaLengkap: object[i].nama_perawat,
                        kategori: object[i].kategori,
                        jenisKelamin: object[i].jenis_kelamin,
                        agama: object[i].agama,
                        tempatAsal: object[i].alamat,
                        tinggiBadan: object[i].tinggi,
                        beratBadan: object[i].berat,
                        pendidikanTerakhir: object[i].pendidikan,
                        namaSekolah: object[i].nama_sekolah,
                        deskripsiPengalaman: object[i].deskripsi_pengalaman,
                        fotoPasien: object[i].gambar
                    })

                    perawatTerdaftar.save()
                        .then((image) => {
                            res.status(200).json({
                                success: true,
                                image,
                            });
                        })
                        .catch(err => res.status(500).json(err));
                })
                .catch(err => res.status(500).json(err));
        });





    /**
     * Xendit API
     * Create Invoice
     */

    imageRouter.route('/xendit/invoice')
        .post(async(req, res) => {
            const { Invoice } = x;
            const invoiceSpecificOptions = {};
            const i = new Invoice(invoiceSpecificOptions);

            const resp = await i.createInvoice({
                externalID: req.body.userId,
                amount: req.body.total_harga,
                payerEmail: req.body.email,
                description: req.body.description,
                shouldSendEmail: true,
                customer: {
                    given_names: req.body.username,
                    email: req.body.email
                },
                paymentMethods: [req.body.payment_method],
                customerNotificationPreference: {
                    invoice_created: ['email'],
                }
            }).catch((error) => {
                res.send(error)
            })

            res.send(resp)
        });

    /**
     * 
     * Get invoice with invoice ID
     */
    imageRouter.route('/xendit/invoice/id')
        .get(async(req, res) => {
            const { Invoice } = x;
            const invoiceSpecificOptions = {};
            const i = new Invoice(invoiceSpecificOptions);

            const response = await i.getInvoice({
                invoiceID: req.body.invoiceId
            })
            res.send(response)
        })

    /**
     * 
     * Get invoice with invoice user ID
     */
    imageRouter.route('/xendit/invoice/userId')
        .get(async(req, res) => {
            const { Invoice } = x;
            const invoiceSpecificOptions = {};
            const i = new Invoice(invoiceSpecificOptions);

            const response = await i.getAllInvoices({
                externalID: req.body.externalId
            })
            res.send(response)
        })

    /**
     * Create Virtual Account
     */

    imageRouter.route('/xendit/va')
        .post(async(req, res) => {
            const { VirtualAcc } = x;
            const vaSpecificOptions = {};
            const va = new VirtualAcc(vaSpecificOptions);

            const expireDate = new Date(req.body.expire_date)
            expireDate.toISOString()

            va.createFixedVA({
                    externalID: req.body.externalId,
                    bankCode: req.body.bank_code,
                    name: req.body.username,
                    isSingleUse: true,
                    expectedAmt: req.body.total_harga,
                    expirationDate: expireDate
                })
                .then(({ id }) => {
                    res.status(200).json({
                        va_id: id
                    });
                })
                .catch(e => {
                    res.send(`VA creation failed with message: ${e.message}`);
                });

        })

    /**
     * GET Virtual Account with ID
     * 
     */

    imageRouter.route('/xendit/va/vaId')
        .get(async(req, res) => {
            const { VirtualAcc } = x;
            const vaSpecificOptions = {};
            const va = new VirtualAcc(vaSpecificOptions);

            const response = await va.getFixedVA({
                id: req.body.va_id,
            })

            res.send(response)
        })

    /**
     * Create E -Wallet
     * 
     */

    imageRouter.route('/xendit/ewallet')
        .post(async(req, res) => {
            const { EWallet } = x;
            const ewalletSpecificOptions = {};
            const ew = new EWallet(ewalletSpecificOptions);

            ew.createEWalletCharge({
                referenceID: req.body.ref_id,
                currency: 'IDR',
                amount: req.body.total_harga,
                checkoutMethod: 'ONE_TIME_PAYMENT',
                channelCode: req.body.wallet_type,
                channelProperties: {
                    mobileNumber: req.body.phone_number,
                },
            }).then(r => {
                res.status(200).json({
                    ewallet_id: r
                });
            });
        })

    /**
     * GET E -Wallet charge
     * 
     */

    imageRouter.route('/xendit/ewallet/charge')
        .get(async(req, res) => {
            const { EWallet } = x;
            const ewalletSpecificOptions = {};
            const ew = new EWallet(ewalletSpecificOptions);

            const response = await ew.getEWalletChargeStatus({
                chargeID: req.body.charge_id
            })
            res.send(response)
        })

    /**
     * Create payment for outlet
     * 
     */

    imageRouter.route('/xendit/retail/')
        .post(async(req, res) => {
            const { RetailOutlet } = x;
            const retailOutletSpecificOptions = {};
            const ro = new RetailOutlet(retailOutletSpecificOptions);

            ro.createFixedPaymentCode({
                externalID: '123',
                retailOutletName: 'ALFAMART',
                name: 'Ervan Adetya',
                expectedAmt: 10000,
            }).then(({ id }) => {
                res.status(200).json({
                    retail_id: id
                });
            });
        })

    /**
     * GET payment for outlet
     * 
     */

    imageRouter.route('/xendit/ewallet/charge')
        .get(async(req, res) => {
            const { RetailOutlet } = x;
            const retailOutletSpecificOptions = {};
            const ro = new RetailOutlet(retailOutletSpecificOptions);

            const response = await ew.ro.getFixedPaymentCode({
                id: req.body.id
            })
            res.send(response)
        })

    return imageRouter;
};
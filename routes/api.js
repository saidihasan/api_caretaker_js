const express = require("express");
const routers = express.Router();
const mongoose = require("mongoose");
const Image = require("../models/image");
const Pengguna = require("../models/pengguna");
const Perawat = require("../models/perawat");
const ServerInvoice = require("../models/invoice");
const PerawatTerdaftar = require("../models/perawatTerdaftar");
const {
  createInvoice,
  createVirtualAccount,
} = require("../contents/payments/Xendit");

const { getAllUser, createUser, getById } = require("../contents/users/Users");
const {
  createPayment,
  updateVirtualAccountPayment,
} = require("../contents/payments/Payment");
const { createOrder, updateStatusOrder } = require("../contents/orders/Order");
const { StatusPayment } = require("../models/payments/payment");
const { StatusOrder } = require("../models/orders/orders");

module.exports = (upload) => {
  const url = `${process.env.DB_DRIVER}://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
  const connect = mongoose.createConnection(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  let gfs;

  connect.once("open", () => {
    // initialize stream
    gfs = new mongoose.mongo.GridFSBucket(connect.db, {
      bucketName: "uploads",
    });
  });

  /*
        POST: Upload a single image/file to Image collection
    */
  routers
    .route("/upload/image")
    .post(upload.single("file"), (req, res, next) => {
      console.log(req.body);
      // check for existing images
      Image.findOne({ userId: req.body.userId })
        .then((image) => {
          console.log(image);
          if (image) {
            return res.status(200).json({
              success: false,
              message: "Image already exists",
            });
          }

          let newImage = new Image({
            caption: req.body.caption,
            filename: req.file.filename,
            fileId: req.file.id,
            userId: req.body.userId,
          });

          newImage
            .save()
            .then((image) => {
              res.status(200).json({
                success: true,
                image,
              });
            })
            .catch((err) => res.status(500).json(err));
        })
        .catch((err) => res.status(500).json(err));
    })
    .get((req, res, next) => {
      Image.find({})
        .then((images) => {
          res.status(200).json({
            success: true,
            images,
          });
        })
        .catch((err) => res.status(500).json(err));
    });

  /*
        GET: Delete an image from the collection
    */
  routers.route("/delete/:id").get((req, res, next) => {
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
            .catch((err) => {
              return res.status(500).json(err);
            });
        } else {
          res.status(200).json({
            success: false,
            message: `File with ID: ${req.params.id} not found`,
          });
        }
      })
      .catch((err) => res.status(500).json(err));
  });

  /*
        GET: Fetch most recently added record
    */
  routers.route("/recent").get((req, res, next) => {
    Image.findOne({}, {}, { sort: { _id: -1 } })
      .then((image) => {
        res.status(200).json({
          success: true,
          image,
        });
      })
      .catch((err) => res.status(500).json(err));
  });

  /*
        POST: Upload multiple files upto 3
    */
  routers.route("/multiple").post(upload.array("file", 3), (req, res, next) => {
    res.status(200).json({
      success: true,
      message: `${req.files.length} files uploaded successfully`,
    });
  });

  /*
        GET: Fetches all the files in the uploads collection
    */
  routers.route("/files").get((req, res, next) => {
    gfs.find().toArray((err, files) => {
      if (!files || files.length === 0) {
        return res.status(200).json({
          success: false,
          message: "No files available",
        });
      }

      files.map((file) => {
        if (
          file.contentType === "image/jpeg" ||
          file.contentType === "image/png" ||
          file.contentType === "image/svg"
        ) {
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
  routers.route("/file/:filename").get((req, res, next) => {
    gfs.find({ filename: req.params.filename }).toArray((err, files) => {
      if (!files[0] || files.length === 0) {
        return res.status(200).json({
          success: false,
          message: "No files available",
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
  routers.route("/image/:filename").get((req, res, next) => {
    gfs.find({ filename: req.params.filename }).toArray((err, files) => {
      if (!files[0] || files.length === 0) {
        return res.status(200).json({
          success: false,
          message: "No files available",
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
      console.log(err);
    });
  });

  /*
        DELETE: Delete a particular file by an ID
    */
  routers.route("/file/del/:id").post((req, res, next) => {
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

  /**
   *
   * POST: Insert one of the Perawat
   */
  routers.route("/user/perawat").post(async (req, res) => {
    Perawat.findOne({ userId: req.body.userId })
      .then((user) => {
        // console.log(user)
        if (user) {
          return res.status(200).json({
            success: false,
            message: "User already created!",
          });
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
          masaBerlakuSertifikat: req.body.masa_berlaku,
        });

        perawatBaru
          .save()
          .then((image) => {
            res.status(200).json({
              success: true,
              image,
            });
          })
          .catch((err) => res.status(500).json(err));
      })
      .catch((err) => res.status(500).json(err));
  });

  /**
   * GET: ALL Perawat
   *
   */
  // routers.route('/users/perawat')
  //     .get(async(req, res) => {
  //         Perawat.find({}, function(err, users) {
  //             var userMap = {}

  //             users.forEach(function(user) {
  //                 userMap[user.id] = user
  //             })
  //             res.send(userMap)
  //         })
  //     })

  routers.route("/users/perawat").get(async (req, res) => {
    Perawat.find({}, function (err, users) {
      if (err) {
        console.log(err);
      } else {
        res.send(users);
      }
    });
  });

  /**
   *
   * GET: get one Perawat
   */

  routers.route("/users/perawat/:user_id").get(async (req, res) => {
    var query = Perawat.where({ userId: req.params.user_id });
    query.findOne((err, user) => {
      if (err || user == null) {
        console.log(err);
        return res.status(200).json({
          success: false,
          user: null,
        });
      } else {
        // res.json(user)
        return res.status(200).json({
          success: true,
          user: user,
        });
      }
    });
  });

  /*
        POST: Insert Bulk of the Perawat Terdaftar 
    */
  routers.route("/user/submit/perawat").post(async (req, res) => {
    let object = Object(req.body.Sheet1);

    console.log(object.length);

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
        fotoPasien: object[i].gambar,
      });

      perawatTerdaftar
        .save()
        .then((data) => {
          res.status(200).json({
            success: true,
            data: data,
          });
        })
        .catch((err) => res.status(500).json(err));
    }
  });

  /**
   *  GET : All Perawat Terdaftar
   */
  routers.route("/users/perawatterdaftar").get(async (req, res) => {
    PerawatTerdaftar.find({}, function (err, users) {
      if (err) {
        console.log(err);
      } else {
        res.send(users);
      }
    });
  });

  /*
         POST: Insert one of the Perawat
        */
  routers.route("/user/perawatterdaftar").post(async (req, res) => {
    PerawatTerdaftar.findOne({ userId: req.body.userId })
      .then((user) => {
        // console.log(user)
        if (user) {
          return res.status(200).json({
            success: false,
            message: "User already created!",
          });
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
          fotoPasien: object[i].gambar,
        });

        perawatTerdaftar
          .save()
          .then((image) => {
            res.status(200).json({
              success: true,
              image,
            });
          })
          .catch((err) => res.status(500).json(err));
      })
      .catch((err) => res.status(500).json(err));
  });

  /**
   * Xendit API
   * Create Invoice
   */

  routers.route("/xendit/invoice").post(async (req, res) => {
    const responseXendit = await createInvoice(req);

    console.log(responseXendit);

    res.send(responseXendit);
  });

  /**
   *
   * Get invoice with invoice ID
   */
  routers.route("/xendit/invoice/id").get(async (req, res) => {
    const { Invoice } = xendit;
    const invoiceSpecificOptions = {};
    const i = new Invoice(invoiceSpecificOptions);

    const response = await i.getInvoice({
      invoiceID: req.body.invoiceId,
    });
    res.send(response);
  });

  /**
   *
   * Get invoice with invoice user ID
   */
  routers.route("/xendit/invoice/userId").get(async (req, res) => {
    const { Invoice } = xendit;
    const invoiceSpecificOptions = {};
    const i = new Invoice(invoiceSpecificOptions);

    const response = await i.getAllInvoices({
      externalID: req.body.externalId,
    });
    res.send(response);
  });

  /**
   * GET Virtual Account with ID
   *
   */

  routers.route("/xendit/va/vaId").get(async (req, res) => {
    const { VirtualAcc } = xendit;
    const vaSpecificOptions = {};
    const va = new VirtualAcc(vaSpecificOptions);

    const response = await va.getFixedVA({
      id: req.body.va_id,
    });

    res.send(response);
  });

  /**
   * Create E -Wallet
   *
   */

  routers.route("/xendit/ewallet").post(async (req, res) => {
    const { EWallet } = xendit;
    const ewalletSpecificOptions = {};
    const ew = new EWallet(ewalletSpecificOptions);

    ew.createEWalletCharge({
      referenceID: req.body.ref_id,
      currency: "IDR",
      amount: req.body.total_harga,
      checkoutMethod: "ONE_TIME_PAYMENT",
      channelCode: req.body.wallet_type,
      channelProperties: {
        mobileNumber: req.body.phone_number,
      },
    }).then((r) => {
      res.status(200).json({
        ewallet_id: r,
      });
    });
  });

  /**
   * GET E -Wallet charge
   *
   */

  routers.route("/xendit/ewallet/charge").get(async (req, res) => {
    const { EWallet } = xendit;
    const ewalletSpecificOptions = {};
    const ew = new EWallet(ewalletSpecificOptions);

    const response = await ew.getEWalletChargeStatus({
      chargeID: req.body.charge_id,
    });
    res.send(response);
  });

  /**
   * Create payment for outlet
   *
   */

  routers.route("/xendit/retail/").post(async (req, res) => {
    const { RetailOutlet } = xendit;
    const retailOutletSpecificOptions = {};
    const ro = new RetailOutlet(retailOutletSpecificOptions);

    ro.createFixedPaymentCode({
      externalID: "123",
      retailOutletName: "ALFAMART",
      name: "Ervan Adetya",
      expectedAmt: 10000,
    }).then(({ id }) => {
      res.status(200).json({
        retail_id: id,
      });
    });
  });

  /**
   * GET payment for outlet
   *
   */

  routers.route("/xendit/ewallet/charge").get(async (req, res) => {
    const { RetailOutlet } = xendit;
    const retailOutletSpecificOptions = {};
    const ro = new RetailOutlet(retailOutletSpecificOptions);

    const response = await ew.ro.getFixedPaymentCode({
      id: req.body.id,
    });
    res.send(response);
  });

  /**
   * New Routes V2
   */
  routers.route("/users/pengguna").post(async (req, res) => {
    const response = await createUser(req.body);
    return res.status(!response.status ? 400 : 200).send(response);
  });

  routers.route("/users/pengguna").get(async (req, res) => {
    const response = await getAllUser();
    return res.status(!response.status ? 404 : 200).send(response);
  });

  routers.route("/users/pengguna/:user_id").get(async (req, res) => {
    const response = await getById(req.params.user_id);
    return res.status(!response.status ? 404 : 200).send(response);
  });

  routers.route("/orders").post(async (req, res) => {
    const order = await createOrder(req.body);

    if (!order.status) {
      return res.sendStatus(400).send(order);
    }

    const response = await createPayment(order.data, req.body);
    res.send(response);
  });

  routers.route("/callback/va").post(async (req, res) => {
    if (req.headers["x-callback-token"] !== process.env.XENDIT_CALLBACK_TOKEN) {
      return res.status(401).send("Gotcha");
    }

    let typeCallback = 1;

    let result = null;
    let statusOrder = StatusOrder.STATUS_PROCESSING;

    if (!("status" in req.body)) {
      // Paid Callback
      typeCallback = 2;
      statusOrder = StatusOrder.STATUS_PAID;
    }

    res.send({
      type: typeCallback,
    });

    if (typeCallback === 1) {
      result = await updateVirtualAccountPayment({
        ...req.body,
        status: StatusPayment.STATUS_ACTIVE,
      });
    } else if (typeCallback === 2) {
      result = await updateVirtualAccountPayment({
        ...req.body,
        status: StatusPayment.STATUS_COMPLETE,
      });
    }

    result = await updateStatusOrder(result.data.order_id, statusOrder);
  });

  routers.route("/callback/retail").post(async (req, res) => {
    if (req.headers["x-callback-token"] !== process.env.XENDIT_CALLBACK_TOKEN) {
      return res.status(401).send("Gotcha");
    }

    res.send("OK");
  });

  return routers;
};

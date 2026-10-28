// Cargamos el módulo de express para poder crear rutas
const { Router } = require("express");
// Llamamos al router
const router = Router();
let fileManager = require("utilities_cuenti/vendor/fileManager");

const objIntegratorTienddiBl = require("../business/integrator-tienddi-bl");
let queue_express = require("express-queue");

router.post("/web_hook_prueba/:codigo", async function (req, res) {
  try {
    console.log(req.body);
    console.log("codigo:" + req.params.codigo);
    res.json({ type: 1, message: "ok" });
  } catch (e) {
    fileManager.managerErrorApi(res, e);
  }
});

router.post("/get_url_store_cuenti", async function (req, res) {
  try {
    let r = await objIntegratorTienddiBl.get_url_store_cuenti(
      req.headers["id-company"],
      req.body,
    );
    res.json(r);
  } catch (e) {
    fileManager.managerErrorApi(res, e);
  }
});

function diferenciaMayorASeisMeses(fecha1, fecha2) {
  // Convertir las cadenas de fecha en objetos Date
  const fechaInicio = new Date(fecha1);
  const fechaFin = new Date(fecha2);

  // Calcular la diferencia en meses
  const añosDiferencia = fechaFin.getFullYear() - fechaInicio.getFullYear();
  const mesesDiferencia = fechaFin.getMonth() - fechaInicio.getMonth();
  const diferenciaTotalMeses = añosDiferencia * 12 + mesesDiferencia;

  // Verificar si la diferencia es mayor a 6 meses
  return diferenciaTotalMeses > 6;
}
router.get(
  "/getMetricas/:id_company/:fecha1/:fecha2/:clave",
  async function (req, res) {
    try {
      if (
        req.params.clave !==
        "jdoaosdoieokoi4oi4o34o234sd485484DWjhhcv5897444343434==="
      ) {
        res.json({
          type: 0,
          message: "clave mala",
        });
      }
      req.params.fecha1 = req.params.fecha1 + " 00:00:00";
      req.params.fecha2 = req.params.fecha2 + " 23:59:59";
      if (diferenciaMayorASeisMeses(req.params.fecha1, req.params.fecha2)) {
        res.json({
          type: 0,
          message: "La diferencia entre las fechas es mayor a seis meses",
        });
      }
      let r = await objIntegratorTienddiBl.getMetricas(
        req.params.id_company,
        req.params,
      );
      let data = fileManager.base64ToFile(r);
      if (r === null) {
        res.json(r);
        return;
      }
      //  var data = fs.readFileSync(name_file);
      res.contentType("application/xlsx");
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=informe_ventas_" +
        req.params.id_company +
        ".xlsx",
      );

      res.send(data.content);
    } catch (e) {
      fileManager.managerErrorApi(res, e);
    }
  },
);

router.get(
  "/getMetricas_producto/:id_company/:id_sucursal/:id_producto/:meses_antes/:export_excel/:clave",
  async function (req, res) {
    try {
      if (
        req.params.clave !==
        "jdoaosdoieokoi4oi4o34o234sd485484DWjhhcv5897444343434==="
      ) {
        res.json({
          type: 0,
          message: "clave mala",
        });
      }
      if (req.params.meses_antes > 12) {
        res.json({
          type: 0,
          message: "La diferencia entre las fechas es mayor a 12 meses",
        });
      }
      let r = await objIntegratorTienddiBl.getMetricas_producto(
        req.params.id_company,
        req.params,
      );
      if (req.params.export_excel == 1) {
        let data = fileManager.base64ToFile(r);
        if (r === null) {
          res.json(r);
          return;
        }
        //  var data = fs.readFileSync(name_file);
        res.contentType("application/xlsx");
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        );
        res.setHeader(
          "Content-Disposition",
          "attachment; filename=informe_ventas_" +
          req.params.id_company +
          ".xlsx",
        );

        res.send(data.content);
      } else {
        res.json(r);
      }
    } catch (e) {
      fileManager.managerErrorApi(res, e);
    }
  },
);

router.post("/createPaymentLink/:clave", async function (req, res) {
  try {
    if (
      req.params.clave !==
      "jdoaosdoieokoi4oi4o34o234sd485484DWjhhcv5897444343434==="
    ) {
      res.json({
        type: 0,
        message: "clave mala",
      });
    }
    let r = await objIntegratorTienddiBl.createPaymentLink(req.body);
    res.json(r);
  } catch (e) {
    fileManager.managerErrorApi(res, e);
  }
});
router.post("/getPaymentLink/:clave", async function (req, res) {
  try {
    if (
      req.params.clave !==
      "jdoaosdoieokoi4oi4o34o234sd485484DWjhhcv5897444343434==="
    ) {
      res.json({
        type: 0,
        message: "clave mala",
      });
    }
    let r = await objIntegratorTienddiBl.getPaymentLink(req.body);
    res.json(r);
  } catch (e) {
    fileManager.managerErrorApi(res, e);
  }
});
router.post("/deletePaymentLink/:clave", async function (req, res) {
  try {
    if (
      req.params.clave !==
      "jdoaosdoieokoi4oi4o34o234sd485484DWjhhcv5897444343434==="
    ) {
      res.json({
        type: 0,
        message: "clave mala",
      });
    }
    let r = await objIntegratorTienddiBl.deletePaymentLink(req.body);
    res.json(r);
  } catch (e) {
    fileManager.managerErrorApi(res, e);
  }
});
router.post("/getConfigurations/:clave", async function (req, res) {
  try {
    if (
      req.params.clave !==
      "jdoaosdoieokoi4oi4o34o234sd485484DWjhhcv5897444343434==="
    ) {
      res.json({
        type: 0,
        message: "clave mala",
      });
    }
    let r = await objIntegratorTienddiBl.getConfigurations(req.body);
    res.json(r);
  } catch (e) {
    fileManager.managerErrorApi(res, e);
  }
});
router.post("/activarPagos/:clave", async function (req, res) {
  try {
    if (
      req.params.clave !==
      "jdoaosdoieokoi4oi4o34o234sd485484DWjhhcv5897444343434==="
    ) {
      res.json({
        type: 0,
        message: "clave mala",
      });
    }
    let r = await objIntegratorTienddiBl.activarPagos(req.body);
    res.json(r);
  } catch (e) {
    fileManager.managerErrorApi(res, e);
  }
});
router.post("/webhookCuentiPay/:codigo", async function (req, res) {
  try {
    let r = await objIntegratorTienddiBl.webhookCuentiPay(
      req.body,
      req.params.codigo,
    );
    if (r.type == 1) {
      res.json(r);
    } else {
      res.status(500);
      res.json({ status: 500, error: r.message });
    }
  } catch (e) {
    fileManager.managerErrorApi(res, e);
  }
});
router.get(
  "/get_conf_modulos_sucursal/:clave/:id_company/:id_sucursal",
  async function (req, res) {
    try {
      if (
        req.params.clave !==
        "jdoaosdoieokoi4oi4o34o234sd485484DWjhhcv5897444343434==="
      ) {
        res.json({
          type: 0,
          message: "clave mala",
        });
      }
      let r = await objIntegratorTienddiBl.get_conf_modulos_sucursal(
        req.params.id_company,
        req.params.id_sucursal,
      );
      res.json(r);
    } catch (e) {
      fileManager.managerErrorApi(res, e);
    }
  },
);

router.get(
  "/get_conf_modulos_sucursal_generarQr_url_dian/:clave/:id_company/:id_sucursal",
  async function (req, res) {
    try {
      if (
        req.params.clave !==
        "jdoaosdoieokoi4oi4o34o234sd485484DWjhhcv5897444343434==="
      ) {
        res.json({
          type: 0,
          message: "clave mala",
        });
      }
      let r =
        await objIntegratorTienddiBl.get_conf_modulos_sucursal_generarQr_url_dian(
          req.params.id_company,
          req.params.id_sucursal,
        );
      res.json(r);
    } catch (e) {
      fileManager.managerErrorApi(res, e);
    }
  },
);

router.get(
  "/get-data-company/:id_empresa/:id_sucursal",
  async function (req, res) {
    try {
      req.params.fecha1 = req.params.fecha1 + " 00:00:00";
      req.params.fecha2 = req.params.fecha2 + " 23:59:59";
      if (diferenciaMayorASeisMeses(req.params.fecha1, req.params.fecha2)) {
        res.json({
          type: 0,
          message: "La diferencia entre las fechas es mayor a seis meses",
        });
      }
      let r = await objIntegratorTienddiBl.get_data_company(
        req.params.id_empresa,
        req.params.id_sucursal,
      );
      res.json(r);
    } catch (e) {
      fileManager.managerErrorApi(res, e);
    }
  },
);
router.post("/pre_activar_plan", async function (req, res) {
  try {
    let r = await objIntegratorTienddiBl.pre_activar_plan(
      req.body.id_empresa,
      req.body.id_transaccion,
    );
    res.json(r);
  } catch (e) {
    fileManager.managerErrorApi(res, e);
  }
});
router.get(
  "/validar_permiso/:clave/:id_company/:id_empleado/:id_permiso",
  async function (req, res) {
    try {
      if (
        req.params.clave !==
        "jdoaosdoieokoi4oi4o34o234sd485484DWjhhcv5897444343434==="
      ) {
        res.json({
          type: 0,
          message: "clave mala",
        });
      }
      let r = await objIntegratorTienddiBl.validar_permiso(
        req.params.id_company,
        req.params.id_empleado,
        req.params.id_permiso,
      );
      res.json(r);
    } catch (e) {
      fileManager.managerErrorApi(res, e);
    }
  },
);
router.get("/get_token_efimero/:clave/:id_company", async function (req, res) {
  try {
    if (
      req.params.clave !==
      "jdoaosdoieokoi4oi4o34o234sd485484DWjhhcv5897444343434==="
    ) {
      res.json({
        type: 0,
        message: "clave mala",
      });
    }
    //validar ip
    //console.log(req.session.id);
    let ip = req.connection.remoteAddress || req.socket.remoteAddress;
    try {
      ip = req.header("x-forwarded-for").split(",")[0].trim();
    } catch (error) { }
    console.log("IP Solicitud token efimero: " + ip);
    ip = ip.split(",")[0].trim();
    let ips = process.env.ips_autorizadas.split(";");
    let sw = false;
    for (let i = 0; i < ips.length; i++) {
      if (ips[i] === ip) {
        sw = true;
        break;
      }
    }
    if (!sw) {
      res.status(203);
      res.json({ mensaje: "ip " + ip + " no autorizada" });
      return;
    }

    let r = await objIntegratorTienddiBl.getTokenEfimero(req.params.id_company);
    res.json(r);
  } catch (e) {
    fileManager.managerErrorApi(res, e);
  }
});

router.get("/get_token_api/:clave/:id_company", async function (req, res) {
  try {
    if (
      req.params.clave !==
      "jdoaosdoieokoi4oi4o34o234sd485484DWjhhcv5897444343434==="
    ) {
      res.json({
        type: 0,
        message: "clave mala",
      });
    }
    //validar ip
    //console.log(req.session.id);
    let ip = req.connection.remoteAddress || req.socket.remoteAddress;
    try {
      ip = req.header("x-forwarded-for").split(",")[0].trim();
    } catch (error) { }
    console.log("IP Solicitud token efimero: " + ip);
    ip = ip.split(",")[0].trim();
    let ips = process.env.ips_autorizadas.split(";");
    let sw = false;
    for (let i = 0; i < ips.length; i++) {
      if (ips[i] === ip) {
        sw = true;
        break;
      }
    }
    if (!sw) {
      res.status(203);
      res.json({ mensaje: "ip " + ip + " no autorizada" });
      return;
    }

    let r = await objIntegratorTienddiBl.get_token_api_get(
      req.params.id_company,
    );
    res.json({ t: r });
  } catch (e) {
    fileManager.managerErrorApi(res, e);
  }
});

router.post(
  "/valiadarRangosDeFechasDeVentasCierreCaja/:clave",
  queue_express({
    activeLimit: 1,
    queuedLimit: 30,
    rejectHandler: (req, res) => {
      // res.sendStatus(500);
      res.status(500);
      res.json({
        status: 500,
        error: "Intente más tarde cola de procesamiento muy llena test",
      });
    },
  }),
  async function (req, res) {
    if (
      req.params.clave !==
      "jdoaosdoieokoi4oi4o34o234sd485484DWjhhcv5897444343434==="
    ) {
      res.json({
        type: 0,
        message: "clave mala",
      });
    }
    try {
      if (
        req.headers["id-company"] == null ||
        req.headers["id-company"] == undefined ||
        req.headers["id-company"] == ""
      ) {
        res.json({
          type: 0,
          message: "id_company no existe",
        });
        return;
      }
      let r =
        await objIntegratorTienddiBl.valiadarRangosDeFechasDeVentasCierreCaja(
          req.headers["id-company"],
          req.body.id_empleado,
          req.body.id_sucursal,
        );
      res.json(r);
    } catch (e) {
      fileManager.managerErrorApi(res, e);
    }
  },
);

router.post(
  "/valiadar_pago_realizado_mesa_columna/:clave",
  queue_express({
    activeLimit: 1,
    queuedLimit: 10,
    rejectHandler: (req, res) => {
      // res.sendStatus(500);
      res.status(500);
      res.json({
        status: 500,
        error: "Intente más tarde cola de procesamiento muy llena test",
      });
    },
  }),
  async function (req, res) {
    if (
      req.params.clave !==
      "jdoaosdoieokoi4oi4o34o234sd485484DWjhhcv5897444343434"
    ) {
      res.json({
        type: 0,
        message: "clave mala",
      });
    }
    try {
      if (
        req.headers["id-company"] == null ||
        req.headers["id-company"] == undefined ||
        req.headers["id-company"] == ""
      ) {
        res.json({
          type: 0,
          message: "id_company no existe",
        });
        return;
      }
      let r = await objIntegratorTienddiBl.valiadar_pago_realizado_mesa_columna(
        req.headers["id-company"],
      );
      res.json(r);
    } catch (e) {
      fileManager.managerErrorApi(res, e);
    }
  },
);

router.get(
  "/get_personalizacion_sucursal/:id_empresa/:id_sucursal",
  queue_express({
    activeLimit: 1,
    queuedLimit: 10,
    rejectHandler: (req, res) => {
      // res.sendStatus(500);
      res.status(500);
      res.json({
        status: 500,
        error: "Intente más tarde cola de procesamiento muy llena test",
      });
    },
  }),
  async function (req, res) {
    try {
      let r = await objIntegratorTienddiBl.get_personalizacion_sucursal(
        req.params.id_empresa,
        req.params.id_sucursal,
      );
      res.json(r);
    } catch (e) {
      fileManager.managerErrorApi(res, e);
    }
  },
);

router.get(
  "/activar_impuesto_consumo_lujo/:id_empresa/:id_sucursal/:es_activo",
  queue_express({
    activeLimit: 1,
    queuedLimit: 10,
    rejectHandler: (req, res) => {
      // res.sendStatus(500);
      res.status(500);
      res.json({
        status: 500,
        error: "Intente más tarde cola de procesamiento muy llena test",
      });
    },
  }),
  async function (req, res) {
    try {
      let r = await objIntegratorTienddiBl.activar_impuesto_consumo_lujo(
        req.params.id_empresa,
        req.params.id_sucursal,
        req.params.es_activo,
      );
      res.json(r);
    } catch (e) {
      fileManager.managerErrorApi(res, e);
    }
  },
);

router.get(
  "/get_consecutivos/:id_empresa",
  queue_express({
    activeLimit: 1,
    queuedLimit: 10,
    rejectHandler: (req, res) => {
      // res.sendStatus(500);
      res.status(500);
      res.json({
        status: 500,
        error: "Intente más tarde cola de procesamiento muy llena test",
      });
    },
  }),
  async function (req, res) {
    try {
      let r = await objIntegratorTienddiBl.get_consecutivos(
        req.params.id_empresa,
      );
      res.json(r);
    } catch (e) {
      fileManager.managerErrorApi(res, e);
    }
  },
);

router.get(
  "/get_empresa_contingencia_datos/:id_empresa",
  queue_express({
    activeLimit: 1,
    queuedLimit: 10,
    rejectHandler: (req, res) => {
      // res.sendStatus(500);
      res.status(500);
      res.json({
        status: 500,
        error: "Intente más tarde cola de procesamiento muy llena test",
      });
    },
  }),
  async function (req, res) {
    try {
      let r = {
        lst_empresa: await objIntegratorTienddiBl.get_empresa_contingencia(
          req.params.id_empresa,
        ),
        lst_consecutivos:
          await objIntegratorTienddiBl.get_consecutivosSistemaContingencia(
            req.params.id_empresa,
          ),
      };
      res.json(r);
    } catch (e) {
      fileManager.managerErrorApi(res, e);
    }
  },
);

router.get(
  "/findActiveEvents/:id_company/:branchId/:slug",
  async function (req, res) {
    try {
      let r = await objIntegratorTienddiBl.findActiveEvents(
        req.params.id_company,
        req.params.branchId,
        req.params.slug,
      );
      res.json(r);
    } catch (e) {
      fileManager.managerErrorApi(res, e);
    }
  },
);

router.get(
  "/consultarEstadoContingencia/:id_empresa/:nit/:id_consecutivo",
  async function (req, res) {
    try {
      let r = await objIntegratorTienddiBl.consultarEstadoContingencia(
        req.params.id_empresa,
        req.params.nit,
        req.params.id_consecutivo,
      );
      res.json(r);
    } catch (e) {
      fileManager.managerErrorApi(res, e);
    }
  },
);

router.get(
  "/validar_bolsas_fe/:id_empresa",
  queue_express({
    activeLimit: 1,
    queuedLimit: 10,
    rejectHandler: (req, res) => {
      // res.sendStatus(500);
      res.status(500);
      res.json({
        status: 500,
        error: "Intente más tarde cola de procesamiento muy llena test",
      });
    },
  }),
  async function (req, res) {
    try {
      let r = await objIntegratorTienddiBl.validarBolsasFE(
        req.params.id_empresa,
      );
      res.json(r);
    } catch (e) {
      fileManager.managerErrorApi(res, e);
    }
  },
);

router.get(
  "/actualizar_costos_caso_punto_caliente",
  queue_express({
    activeLimit: 1,
    queuedLimit: 1,
    rejectHandler: (req, res) => {
      // res.sendStatus(500);
      res.status(500);
      res.json({
        status: 500,
        error: "Intente más tarde cola de procesamiento muy llena test",
      });
    },
  }),
  async function (req, res) {
    try {
      let r = await objIntegratorTienddiBl.actualizarCostosCasoPuntoCaliente(
        req.query.id_empresa,
        req.query.id_centro_costo,
        req.query.id_sucursal,
      );
      res.json(r);
    } catch (e) {
      fileManager.managerErrorApi(res, e);
    }
  },
);
router.get(
  "/actualizar_costos_caso_compras",
  queue_express({
    activeLimit: 1,
    queuedLimit: 1,
    rejectHandler: (req, res) => {
      // res.sendStatus(500);
      res.status(500);
      res.json({
        status: 500,
        error: "Intente más tarde cola de procesamiento muy llena test",
      });
    },
  }),
  async function (req, res) {
    try {
      let r = await objIntegratorTienddiBl.actualizarCostosCasoPuntoCaliente(
        req.query.id_empresa,
        req.query.id_centro_costo,
        req.query.id_sucursal,
      );
      res.json(r);
    } catch (e) {
      fileManager.managerErrorApi(res, e);
    }
  },
);

router.get(
  "/lista_empresas_id",
  queue_express({
    activeLimit: 1,
    queuedLimit: 1,
    rejectHandler: (req, res) => {
      // res.sendStatus(500);
      res.status(500);
      res.json({
        status: 500,
        error: "Intente más tarde cola de procesamiento muy llena test",
      });
    },
  }),
  async function (req, res) {
    try {
      let r = await objIntegratorTienddiBl.lista_empresas_id(
        req.query.id_empresa,
      );
      res.json(r);
    } catch (e) {
      fileManager.managerErrorApi(res, e);
    }
  },
);

router.post(
  "/get_ordenes_compra_interna_cantidad",
  queue_express({
    activeLimit: 1,
    queuedLimit: 5,
    rejectHandler: (req, res) => {
      // res.sendStatus(500);
      res.status(500);
      res.json({
        status: 500,
        error: "Intente más tarde cola de procesamiento muy llena test",
      });
    },
  }),
  async function (req, res) {
    try {
      if (
        req.headers["id-company"] == null ||
        req.headers["id-company"] == undefined ||
        req.headers["id-company"] == ""
      ) {
        res.json({
          type: 0,
          message: "id_company no existe",
        });
        return;
      }
      let r = await objIntegratorTienddiBl.get_ordenes_compra_interna_cantidad(
        req.headers["id-company"],
        req.body.id_sucursal,
        req.body.id_producto,
      );
      res.json(r);
    } catch (e) {
      fileManager.managerErrorApi(res, e);
    }
  },
);

router.post(
  "/get_ordenes_compra_a_cantidad",
  queue_express({
    activeLimit: 1,
    queuedLimit: 5,
    rejectHandler: (req, res) => {
      // res.sendStatus(500);
      res.status(500);
      res.json({
        status: 500,
        error: "Intente más tarde cola de procesamiento muy llena test",
      });
    },
  }),
  async function (req, res) {
    try {
      if (
        req.headers["id-company"] == null ||
        req.headers["id-company"] == undefined ||
        req.headers["id-company"] == ""
      ) {
        res.json({
          type: 0,
          message: "id_company no existe",
        });
        return;
      }
      let r = await objIntegratorTienddiBl.get_ordenes_compra_a_cantidad(
        req.headers["id-company"],
        req.body.id_sucursal,
        req.body.id_producto,
      );
      res.json(r);
    } catch (e) {
      fileManager.managerErrorApi(res, e);
    }
  },
);
router.post(
  "/consultar_empresa_sucursal",
  queue_express({
    activeLimit: 1,
    queuedLimit: 5,
    rejectHandler: (req, res) => {
      // res.sendStatus(500);
      res.status(500);
      res.json({
        status: 500,
        error: "Intente más tarde cola de procesamiento muy llena test",
      });
    },
  }),
  async function (req, res) {
    try {
      let r = await objIntegratorTienddiBl.consultar_empresa_sucursal(
        req.body.id_empresa,
        req.body.id_sucursal,
      );
      res.json(r);
    } catch (e) {
      fileManager.managerErrorApi(res, e);
    }
  },
);

router.get(
  "/get_cuenti_pay_boton_confirmar_pago",
  queue_express({
    activeLimit: 1,
    queuedLimit: 1,
    rejectHandler: (req, res) => {
      // res.sendStatus(500);
      res.status(500);
      res.json({
        status: 500,
        error: "Intente más tarde cola de procesamiento muy llena test",
      });
    },
  }),
  async function (req, res) {
    try {
      let r = await objIntegratorTienddiBl.get_cuenti_pay_boton_confirmar_pago(
        req.query.id,
      );
      res.json(r);
    } catch (e) {
      fileManager.managerErrorApi(res, e);
    }
  },
);

router.get(
  "/listaSucursalesCache",
  queue_express({
    activeLimit: 1,
    queuedLimit: 5,
    rejectHandler: (req, res) => {
      // res.sendStatus(500);
      res.status(500);
      res.json({
        status: 500,
        error: "Intente más tarde cola de procesamiento muy llena test",
      });
    },
  }),
  async function (req, res) {
    try {
      let r = await objIntegratorTienddiBl.listaSucursalesCache(
        req.query.id_empresa,
      );
      res.json(r);
    } catch (e) {
      fileManager.managerErrorApi(res, e);
    }
  },
);

router.get(
  "/insert_cola_empresa",
  queue_express({
    activeLimit: 1,
    queuedLimit: 5,
    rejectHandler: (req, res) => {
      // res.sendStatus(500);
      res.status(500);
      res.json({
        status: 500,
        error: "Intente más tarde cola de procesamiento muy llena test",
      });
    },
  }),
  async function (req, res) {
    try {
      if (
        req.headers["clave"] !==
        "jdoaosdoieokoi4oi4o34o234sd485484DWjhhcv5897444343434==="
      ) {
        res.json({
          type: 0,
          message: "clave mala",
        });
      }
      let r = await objIntegratorTienddiBl.insert_cola_empresa(
        req.headers["id-company"],
        req.query.evento,
      );
      res.json(r);
    } catch (e) {
      fileManager.managerErrorApi(res, e);
    }
  },
);

router.get(
  "/buscar_empresa",
  queue_express({
    activeLimit: 1,
    queuedLimit: 5,
    rejectHandler: (req, res) => {
      res.status(500);
      res.json({
        status: 500,
        error: "Intente más tarde cola de procesamiento muy llena test",
      });
    },
  }),
  async function (req, res) {
    try {
      if (
        req.headers["clave"] !==
        "jdoaosdoieokoi4oi4o34o234sd485484DWjhhcv5897444343434==="
      ) {
        res.json({
          type: 0,
          message: "clave mala",
        });
        return;
      }
      let r = await objIntegratorTienddiBl.buscar_empresa(req.query);
      res.json(r);
    } catch (e) {
      fileManager.managerErrorApi(res, e);
    }
  },
);

router.get(
  "/get_id_sucursal_documento/:id_empresa/:id_documento/:tipo_documento",
  queue_express({
    activeLimit: 2,
    queuedLimit: 20,
    rejectHandler: (req, res) => {
      // res.sendStatus(500);
      res.status(500);
      res.json({
        status: 500,
        error: "Intente más tarde cola de procesamiento muy llena test",
      });
    },
  }),
  async function (req, res) {
    try {
      let r = await objIntegratorTienddiBl.get_id_sucursal_documento(
        req.params.id_empresa,
        req.params.id_documento,
        req.params.tipo_documento,
      );
      res.json(r);
    } catch (e) {
      fileManager.managerErrorApi(res, e);
    }
  },
);

router.get(
  "/get_conf_modulos_sucursal_obtenerVariable/:id_empresa/:id_sucursal/:variable/:defecto",
  queue_express({
    activeLimit: 2,
    queuedLimit: 20,
    rejectHandler: (req, res) => {
      // res.sendStatus(500);
      res.status(500);
      res.json({
        status: 500,
        error: "Intente más tarde cola de procesamiento muy llena test",
      });
    },
  }),
  async function (req, res) {
    try {
      let r =
        await objIntegratorTienddiBl.get_conf_modulos_sucursal_obtenerVariable(
          req.params.id_empresa,
          req.params.id_sucursal,
          req.params.variable,
          req.params.defecto,
        );
      res.json(r);
    } catch (e) {
      fileManager.managerErrorApi(res, e);
    }
  },
);

router.get(
  "/insert_empresa_conector_aplicacion",
  queue_express({
    activeLimit: 1,
    queuedLimit: 1,
    rejectHandler: (req, res) => {
      // res.sendStatus(500);
      res.status(500);
      res.json({
        status: 500,
        error: "Intente más tarde cola de procesamiento muy llena test",
      });
    },
  }),
  async function (req, res) {
    try {
      let r = await objIntegratorTienddiBl.insert_empresa_conector_aplicacion(
        req.query.id_empresa, req.query.aplicacion
      );
      res.json(r);
    } catch (e) {
      fileManager.managerErrorApi(res, e);
    }
  },
);


const LISTA_IDENTIFICACIONES = [
  { "id_tipo_identificacion": 1, "nombre": "Registro civil", "codigo": "11", "es_activo": 1, "abreviatura": "RC", "pais": "general" },
  { "id_tipo_identificacion": 2, "nombre": "Tarjeta de identidad", "codigo": "12", "es_activo": 1, "abreviatura": "TI", "pais": "Colombia" },
  { "id_tipo_identificacion": 3, "nombre": "Cedula de ciudadania", "codigo": "13", "es_activo": 1, "abreviatura": "CC", "pais": "general" },
  { "id_tipo_identificacion": 4, "nombre": "Tarjeta de extranjeria", "codigo": "21", "es_activo": 1, "abreviatura": "TE", "pais": "Colombia" },
  { "id_tipo_identificacion": 5, "nombre": "Cedula de extranjeria", "codigo": "22", "es_activo": 1, "abreviatura": "CE", "pais": "general" },
  { "id_tipo_identificacion": 6, "nombre": "NIT", "codigo": "31", "es_activo": 1, "abreviatura": "NIT", "pais": "general" },
  { "id_tipo_identificacion": 7, "nombre": "Pasaporte", "codigo": "41", "es_activo": 1, "abreviatura": "PASAPORTE", "pais": "general" },
  { "id_tipo_identificacion": 8, "nombre": "Documento de identificacion extranjero", "codigo": "42", "es_activo": 1, "abreviatura": "Identificacion", "pais": "general" },
  { "id_tipo_identificacion": 9, "nombre": "Otro", "codigo": "91", "es_activo": 1, "abreviatura": "Identificacion", "pais": "general" },
  { "id_tipo_identificacion": 10, "nombre": "RTN", "codigo": "92", "es_activo": 1, "abreviatura": "RTN", "pais": "Honduras" },
  { "id_tipo_identificacion": 11, "nombre": "RUC", "codigo": "93", "es_activo": 1, "abreviatura": "RUC", "pais": "Peru" },
  { "id_tipo_identificacion": 12, "nombre": "DNI", "codigo": "94", "es_activo": 1, "abreviatura": "DNI", "pais": "Peru" },
  { "id_tipo_identificacion": 13, "nombre": "Identificacion", "codigo": "95", "es_activo": 1, "abreviatura": "Identificacion", "pais": "general" },
  { "id_tipo_identificacion": 14, "nombre": "RNC", "codigo": "96", "es_activo": 1, "abreviatura": "RNC", "pais": "Dominican Republic" },
  { "id_tipo_identificacion": 15, "nombre": "Cédula Física", "codigo": "01", "es_activo": 1, "abreviatura": "CF", "pais": "Costa Rica" },
  { "id_tipo_identificacion": 16, "nombre": "Cédula Jurídica", "codigo": "02", "es_activo": 1, "abreviatura": "CJ", "pais": "Costa Rica" },
  { "id_tipo_identificacion": 17, "nombre": "DIMEX", "codigo": "03", "es_activo": 1, "abreviatura": "DIMEX", "pais": "Costa Rica" },
  { "id_tipo_identificacion": 18, "nombre": "NITE", "codigo": "04", "es_activo": 1, "abreviatura": "NITE", "pais": "Costa Rica" },
  { "id_tipo_identificacion": 19, "nombre": "Cédula", "codigo": "01", "es_activo": 1, "abreviatura": "CC", "pais": "Panama" },
  { "id_tipo_identificacion": 20, "nombre": "RUC", "codigo": "02", "es_activo": 1, "abreviatura": "RUC", "pais": "Panama" },
  { "id_tipo_identificacion": 21, "nombre": "RUC(Gobierno)", "codigo": "03", "es_activo": 1, "abreviatura": "RUCG", "pais": "Panama" }
];

const normalizarPais = (v) => String(v || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();

router.get("/lista_indetificaciones", async function (req, res) {
  try {
    const pais = normalizarPais(req.query.pais);
    const r = pais
      ? LISTA_IDENTIFICACIONES.filter((t) => normalizarPais(t.pais) === "general" || normalizarPais(t.pais) === pais)
      : LISTA_IDENTIFICACIONES;
    res.json(r);
  } catch (e) {
    fileManager.managerErrorApi(res, e);
  }
});


const API_CUENTI = "https://api.cuenti.co/jServerj4ErpPro/j4pro";
const S3_BASE = "https://s3-us-west-2.amazonaws.com/documentosj4";

router.get("/imagen_empresa/:idEmpresa/:idSucursal", async function (req, res) {
  try {
    const { idEmpresa, idSucursal } = req.params;
    const cacheName = `cache_imagen_empresa_${idEmpresa}_${idSucursal}`;
    const cachedResponse = await objIntegratorTienddiBl.getFromCache(cacheName);

    if (cachedResponse !== null) {
      return res.json(cachedResponse);
    }

    const tokenEmpresa = req.header("x-auth-token-empresa") || idEmpresa;

    const resp = await fetch(
      `${API_CUENTI}/admin/empresa/consultarEmpresaImagen/${encodeURIComponent(idEmpresa)}/${encodeURIComponent(idSucursal)}`,
      { headers: { "X-Auth-Token-empresa": tokenEmpresa } }
    );
    if (!resp.ok) {
      const response = { url: null, error: "No se pudo consultar la imagen" };
      await objIntegratorTienddiBl.storeInCache(cacheName, response, 60 * 30);
      return res.status(resp.status).json(response);
    }

    const data = await resp.json();
    const message = (data && data.message) || "";

    // Formato esperado: "<idEmpresa>_<idSucursal>;<extension>"  ->  "1_1;jpeg"
    const [nombre, extension] = message.split(";");
    if (!nombre || !extension) {
      const response = { url: null };
      await objIntegratorTienddiBl.storeInCache(cacheName, response, 60 * 30);
      return res.json(response);
    }

    const url = `${S3_BASE}/${encodeURIComponent(idEmpresa)}/imagenes_empresa/${nombre}.${extension}`;
    const response = { url, nombre, extension };
    await objIntegratorTienddiBl.storeInCache(cacheName, response, 60 * 30);
    res.json(response);
  } catch (e) {
    fileManager.managerErrorApi(res, e);
  }
});

// Exportamos las funciones en un objeto
module.exports = router;

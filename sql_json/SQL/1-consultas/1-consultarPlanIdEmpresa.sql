SELECT  vc.es_recurrente,vc.tipo_comision,vc.valor AS valor_comision,vc.nombre AS nombre_tipo_comosion,vc.id_configuracion_vendedor,e.id_vendedor,v.nombre_aliado,v.comision_fe,v.nombre_completo AS nombre_completo_vendedor,v.nombre_software AS nombre_software_vendedor,v.identificacion AS identificacion_vendedor, empresa_estadistica.vencimiento_certificado,empresa_estadistica.es_factura_electronica,e.app_desconectada,e.software_factura_electronica,e.id_empresa,ep.id_aplicacion_empresa,e.nit_empresa,e.nombre_empresa,ep.fecha_registro AS fechaRegistro_plataforma,ep.fecha_vencimiento,
                    e.pais,e.telefono,e.ciudad,e.contacto,e.email_documentos,e.id_sector_empresa,se.nombre_sector_empresa,cl.id_cliente,cl.id_clase_cliente,
                    (SELECT sucursales FROM plan_empresa pm WHERE pm.id_empresa=e.id_empresa AND pm.es_activo=1 ORDER BY id_plan_empresa DESC LIMIT 1) AS sucursales,
                    (SELECT id_tiempo FROM plan_empresa pm WHERE pm.id_empresa=e.id_empresa AND pm.es_activo=1 ORDER BY id_plan_empresa DESC LIMIT 1) AS id_tiempo,
                    (SELECT es_davivienda FROM plan_empresa pm WHERE pm.id_empresa=e.id_empresa AND pm.es_activo=1 ORDER BY id_plan_empresa DESC LIMIT 1) AS es_davivienda,
                    (SELECT mensajes_disponibles FROM  admin_bolsa_mensajes  WHERE admin_bolsa_mensajes.id_empresa=e.id_empresa ORDER BY id_bolsa_mensajes DESC LIMIT 1) AS mensajes_disponibles,
                    (SELECT id FROM  nomina_pago_plan  WHERE nomina_pago_plan.id_empresa=e.id_empresa AND nomina_pago_plan.es_activo=1 ORDER BY id DESC LIMIT 1) AS id_nomina,
                    (SELECT numero_empleados FROM  nomina_pago_plan  WHERE nomina_pago_plan.id_empresa=e.id_empresa AND nomina_pago_plan.es_activo=1 ORDER BY id DESC LIMIT 1) AS numero_empleados_nomina,
                    (SELECT es_ilimitado FROM  nomina_pago_plan  WHERE nomina_pago_plan.id_empresa=e.id_empresa AND nomina_pago_plan.es_activo=1 ORDER BY id DESC LIMIT 1) AS es_ilimitado_nomina,
                    (SELECT fecha_vencimiento FROM  nomina_pago_plan  WHERE nomina_pago_plan.id_empresa=e.id_empresa AND nomina_pago_plan.es_activo=1 ORDER BY id DESC LIMIT 1) AS fecha_vencimiento_nomina,
                    (SELECT json_data_plan FROM plan_empresa pm WHERE pm.id_empresa=e.id_empresa AND pm.es_activo=1 ORDER BY id_plan_empresa DESC LIMIT 1) AS json_data_plan,
                    (SELECT id_plan FROM plan_empresa pm WHERE pm.id_empresa=e.id_empresa AND pm.es_activo=1 ORDER BY id_plan_empresa DESC LIMIT 1) AS id_plan,
                    (SELECT id_plan_empresa FROM plan_empresa pm WHERE pm.id_empresa=e.id_empresa AND pm.es_activo=1 ORDER BY id_plan_empresa DESC LIMIT 1) AS id_plan_empresa,
                    (SELECT nombre FROM plan_empresa pm WHERE pm.id_empresa=e.id_empresa AND pm.es_activo=1 ORDER BY id_plan_empresa DESC LIMIT 1) AS plan,
                    (SELECT fecha_registro FROM plan_empresa pm WHERE pm.id_empresa=e.id_empresa AND pm.es_activo=1 ORDER BY id_plan_empresa DESC LIMIT 1) AS fecha_pago_plan,
                    (SELECT fecha_activacion FROM fe_pago_plan pm WHERE pm.id_empresa=e.id_empresa  ORDER BY fecha_activacion DESC LIMIT 1) AS fecha_activacion,
                    (SELECT cantidad_documentos FROM fe_saldo_bolsa pm WHERE pm.id_empresa=e.id_empresa  ORDER BY id DESC LIMIT 1) AS cantidad_documentos,
                    (SELECT valor_plan FROM plan_empresa pm WHERE pm.id_empresa=e.id_empresa AND pm.es_activo=1 ORDER BY id_plan_empresa DESC LIMIT 1) AS valor_plan,
                    (SELECT fecha_vencimiento FROM plan_empresa pm WHERE pm.id_empresa=e.id_empresa AND pm.es_activo=1 ORDER BY id_plan_empresa DESC LIMIT 1 ) AS fecha_vencimiento_plan, 
                    (SELECT nombreBaseDatos FROM aplicaciones_empresa ae WHERE ae.id_empresa=e.id_empresa LIMIT 1)AS nombreBaseDatos 
                    FROM empresas e INNER JOIN aplicaciones_empresa ep ON(e.id_empresa=ep.id_empresa) LEFT JOIN sector_empresa se ON(se.id_sector_empresa=e.id_sector_empresa)
                    LEFT JOIN empresa_estadistica ON(empresa_estadistica.id_empresa=e.id_empresa)
                    LEFT JOIN vendedor v ON (v.id_vendedor=e.id_vendedor)
                    LEFT JOIN vendedor_configuracion_comision vc ON (vc.id_configuracion_vendedor=v.id_configuracion_vendedor)
                    LEFT JOIN produccion_j4_Erp_interpronosticos.adm_cliente cl ON(cl.id_empresa_portal=e.id_empresa) WHERE  e.id_empresa=:id_empresa AND e.es_activo=1 GROUP BY e.id_empresa ;
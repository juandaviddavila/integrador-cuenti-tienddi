SELECT p.id_producto,p.sku,p.codigo_barras,p.nombre,ps.precio_venta,ps.precio_venta_online,ps.existencias,p.controla_inventario_tienda_linea,img.ext1,img.ext2,p.total_estampilla,p.total_impoconsumo,
 configuracion_dinamica,ps.id_sucursal,p.vender_solo_presentacion,p.presentaciones,
 p.es_servicio,p.vende_sin_existencia,p.id_marca,i.tipo_impuesto,p.id_categoria,ps.id_impuesto,
i.valor_impuesto,p.id_tipo_medida,p.id_imagen,p.invima,p.cum,
p.nota,m.nombre_marca,u.nombre AS unidad_medida,i.nombre_impuesto,c.nombre_categoria,prov.nombre_cliente AS nombre_proveedor
,prov.identificacion AS identificacion_proveedor,i.clasificacion_tributaria,p.id_tipo_producto,ps.precio_compra,ps.costo
 FROM inv_producto p INNER JOIN inv_producto_sucursal ps
 ON(p.id_producto=ps.id_producto) 
 INNER JOIN inv_categoria c ON(c.id_categoria=p.id_categoria)
INNER JOIN adm_impuestos i ON(i.id_impuesto=ps.id_impuesto)
INNER JOIN inv_marca m ON(m.id_marca=p.id_marca)
INNER JOIN adm_unidad_medida u ON(u.id=p.id_tipo_medida)
LEFT JOIN adm_imagenes img ON(p.id_imagen=img.id_imagen)  
LEFT JOIN adm_cliente prov ON(prov.id_cliente=ps.id_proveedor)
 WHERE  es_ingrediente=0 AND ps.es_activo=1 AND p.mostrar_tienda_linea=1 AND p.id_padre IS NULL AND ps.id_sucursal=:id_sucursal 
 /*and p.id_producto=21*/
  {{adicional}} ORDER BY p.id_producto LIMIT :desde,:hasta;


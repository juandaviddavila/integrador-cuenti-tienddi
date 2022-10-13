 SELECT e.id_empresa AS id_company,e.nit_empresa AS identification_number,e.nombre_empresa AS name_company, CONCAT('https://tienddi.co/tienda/', t.alias_tienda_j4pro) AS url FROM  tienda_configuracion_tienda_linea  AS t 
 INNER JOIN empresas e ON(e.id_empresa=t.id_empresa)
 WHERE t.id_empresa=:id_company AND t.id_sucursal_wcomercer IS NULL AND id_sucursal_j4pro=:id_branch;
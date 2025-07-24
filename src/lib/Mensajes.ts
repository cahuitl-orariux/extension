export const MENSAJES = {
	/**
	 * Mensaje para enviar los horarios del SAES al background
	 */
	ENVIAR_HORARIOS: "ENVIAR_HORARIOS",
	EXTRAER_HORARIOS: "EXTRAER_HORARIOS",
	INICIA_EXTRACCION_HORARIOS: "INICIA_EXTRACCION_HORARIOS",
	/**
	 * Mensaje que se envía al terminar de inicializar la extensión en la página de horarios.
	 */
	PAGINA_HORARIOS_INIT: "PAGINA_HORARIOS_INIT",
	ACTUALIZAR_HORARIOS: "ACTUALIZAR_HORARIOS",
	/**
	 * Mensaje que se envía cuando se selecciona una materia en la página de horarios.
	 * Este mensaje no actualiza el arreglo de materias seleccionadas en el SAES, únicamente en background
	 */
	MATERIA_SELECCIONADA: "MATERIA_SELECCIONADA",
	/**
	 * Mensaje para limpiar la lista de materias seleccionadas
	 */
	LIMPIAR_MATERIAS_SELECCIONADAS: "LIMPIAR_MATERIAS_SELECCIONADAS",
	TODAS_MATERIAS_A_CAHUITL: "TODAS_MATERIAS_A_GENERADOR",
	/**
	 * Anunciar inicio de la extensión en la página de cahuitl-orariux.
	 *
	 */
	PAGINA_CAHUITL_ORARIUX_INIT: "PAGINA_CAHUITL_ORARIUX_INIT",
	/**
	 * Mensaje para enviar la selección de materias a la página de cahuitl-orariux
	 */
	SELECCION_A_CAHUITL: "SELECCION_A_CAHUITL",
};

export const CONSTANTES = {
	URL_GENERADOR_DEV: "http://localhost:5173/",
	URL_CAHUITL_ORARIUX: "https://cahuitl-orariux.github.io/",
	PATRON_URL_IPN: "https://*.ipn.mx/*",
};

export type Config = {
	version: number;
	AUTOIMPORTAR_HORARIOS: boolean;
	SINCRONIZAR_SELECCION_CAHUITL: boolean;
};

export const DEFAULT_CONFIG: Config = {
	version: 1,
	AUTOIMPORTAR_HORARIOS: true,
	SINCRONIZAR_SELECCION_CAHUITL: false,
};

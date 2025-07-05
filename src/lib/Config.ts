export const CONSTANTES = {
	URL_GENERADOR_DEV: "http://localhost:5173/",
	URL_CAHUITL_ORARIUX: "https://cahuitl-orariux.github.io/",
	PATRON_URL_IPN: "https://*.ipn.mx/*",
};

export type Config = {
	AUTOIMPORTAR_HORARIOS: boolean;
};

export const DEFAULT_CONFIG: Config = {
	AUTOIMPORTAR_HORARIOS: true,
};

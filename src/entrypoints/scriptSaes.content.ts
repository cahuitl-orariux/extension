import { csv2json } from "kesos-ipnsaes-api/csv2json";
import { Materia, materiasFromDiccionario } from "kesos-ipnsaes-api/Materias";
import CasillaVerificacion from "@/lib/CasillaVerificacion.svelte";
import BotonSeleccionarTodasMaterias from "@/lib/BotonSeleccionarTodasMaterias.svelte";
import { MENSAJES } from "@/lib/Mensajes";
import {
	buscarCoincidenciaAlgunSelector,
	SELECTOR_SAES,
} from "@/lib/Selectores";
import { mount } from "svelte";
import BotonLimpiarSeleccionDeMaterias from "@/lib/BotonLimpiarSeleccionDeMaterias.svelte";
import { CONSTANTES } from "@/lib/Config";
import NavbarHorarios from "@/lib/NavbarHorarios.svelte";

const RUTA_HORARIOS_CLASE = "/Academica/horarios.aspx";
const RUTA_EVALUACION_PROFESOR =
	"/Alumnos/Evaluacion_Docente/evaluacion_profesor.aspx";

const mapeoDiasMaterias = {
	lunes: ["Lun"],
	martes: ["Mar"],
	miercoles: ["Mie"],
	jueves: ["Jue"],
	viernes: ["Vie"],
	sabado: ["Sab"],
};

let materiasPagina = {
	materias: [] as Materia[],
	/**
	 * Diccionario de busqueda por id de materia para obtener el indice de la materia en el array de materias
	 */
	diccionarioMateriaIndice: {} as Record<string, number>,
	encabezados: [] as string[],
	escuela: "",
	ciclo: "",
};

let materiasSeleccionadas: Materia[] = [];

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.tipo === MENSAJES.EXTRAER_HORARIOS) {
		console.log("Mensaje de extracción de horarios recibido");

		chrome.runtime.sendMessage({
			tipo: MENSAJES.ENVIAR_HORARIOS,
			dato: {
				horarios: materiasPagina.materias,
			},
		});
	}

	if (message.tipo === MENSAJES.ACTUALIZAR_HORARIOS) {
		let turnoIndex = message.dato.turnoIndex;
		let periodoIndex = message.dato.periodoIndex;

		const htmlSelectTurno = buscarCoincidenciaAlgunSelector(
			SELECTOR_SAES.TURNO
		) as HTMLSelectElement;
		const htmlSelectPeriodo = buscarCoincidenciaAlgunSelector(
			SELECTOR_SAES.PERIODO
		) as HTMLSelectElement;

		if (htmlSelectTurno.selectedIndex !== turnoIndex) {
			htmlSelectTurno.selectedIndex = turnoIndex;
		}

		if (htmlSelectPeriodo.selectedIndex !== periodoIndex) {
			htmlSelectPeriodo.selectedIndex = periodoIndex;
			htmlSelectPeriodo.dispatchEvent(new Event("change"));
		} else {
			htmlSelectPeriodo.selectedIndex = periodoIndex;
			htmlSelectPeriodo.dispatchEvent(new Event("change"));
		}
	}

	sendResponse({ dato: "OK" });
});

const botones = async () => {
	// TODO: refactorizar
	// Probablemente borrar y hacer automática la extracción de datos, ya sea con selección manual (tipo MODSAES) o un botón para exportar todos los datos y permir la selección en la página
	// Para el caso de autenticación de usuario, la extensión tiene acceso a la cookie del usuario, esta puede ser enviada al servidor para validar que la sesión está activa en el saes, aún no sé exactamente cómo (se debe tomar en cuenta que no tenga mucha carga el server), pero podría ser una petición GET con la cookie y checar el html.
	// Casi descartada la opción de la credencial, ya que un ataque de fuerza bruta sería muy sencillo o si alguien robara la credencial
	const horariosTable: HTMLTableElement | null =
		(buscarCoincidenciaAlgunSelector(
			SELECTOR_SAES.HORARIOS
		) as HTMLTableElement) ?? null;
	console.log("Iniciando función...");

	const filaExtra = document.createElement("tr");
	(
		buscarCoincidenciaAlgunSelector(SELECTOR_SAES.MAIN_COPY)
			?.firstChild as Element
	).insertAdjacentElement("afterend", filaExtra);

	mount(NavbarHorarios, {
		target: filaExtra,
		props: {
			limpieza: () => {
				chrome.runtime.sendMessage({
					tipo: MENSAJES.LIMPIAR_MATERIAS_SELECCIONADAS,
					dato: {},
				});
				materiasSeleccionadas = [];
				actualizarSeleccionDeMaterias();
			},
			exportarSeleccion: () => {
				chrome.runtime.sendMessage({
					tipo: MENSAJES.SELECCION_A_CAHUITL,
				});
			},
		},
	});
};

const procesarTablaHorarios = () => {
	let materias: Materia[] = [];
	let encabezados: string[] = [];
	const horariosTable: HTMLTableElement | null =
		(buscarCoincidenciaAlgunSelector(
			SELECTOR_SAES.HORARIOS
		) as HTMLTableElement) ?? null;

	if (!horariosTable) {
		console.log(
			"No se pudo encontrar el elemento de horarios. Contacte con el desarrollador."
		);
		return {
			materias: [],
			diccionarioMateriaIndice: {},
			encabezados: [],
			escuela: "",
			ciclo: "",
		};
	}

	encabezados = horariosTable.innerText.split("\n")[0].split("\t");
	materias = csv2json(horariosTable.innerText, {
		preprocesarHorarios: true,
		delimiter: "\t",
	});

	const indicesEncabezadosDias = {
		lunes: encabezados.findIndex((encabezado) =>
			mapeoDiasMaterias.lunes.includes(encabezado)
		),
		martes: encabezados.findIndex((encabezado) =>
			mapeoDiasMaterias.martes.includes(encabezado)
		),
		miercoles: encabezados.findIndex((encabezado) =>
			mapeoDiasMaterias.miercoles.includes(encabezado)
		),
		jueves: encabezados.findIndex((encabezado) =>
			mapeoDiasMaterias.jueves.includes(encabezado)
		),
		viernes: encabezados.findIndex((encabezado) =>
			mapeoDiasMaterias.viernes.includes(encabezado)
		),
		sabado: encabezados.findIndex((encabezado) =>
			mapeoDiasMaterias.sabado.includes(encabezado)
		),
	};

	let filasHorarios = horariosTable.querySelectorAll("tr");
	let indiceFilaMateria = 0;
	filasHorarios.forEach((fila, i) => {
		if (i === 0) {
			const encabezado = document.createElement("th");
			encabezado.textContent = "#";
			fila.appendChild(encabezado);
			return;
		}

		const td = document.createElement("td");
		fila.appendChild(td);

		// Validar que la materia tenga horario de clase
		let filaColumnas = fila.innerText.split("\t");
		const indicesDias = Object.values(indicesEncabezadosDias);
		if (
			!(
				// Verdadero si tiene clase al menos una vez
				filaColumnas.some((filaColumna, i) => {
					if (indicesDias.includes(i)) {
						return filaColumna.trim() !== "";
					}
					return false;
				})
			)
		)
			return; // No tiene horario de clase

		fila.id = materias[indiceFilaMateria].id; // TODO TEST: siempre coincide el índice de la materia con el número de fila

		mount(CasillaVerificacion, {
			target: td,
			props: {
				id: materias[indiceFilaMateria].id,
				materiaSeleccionada: materiasSeleccionadas.some(
					(m) => m.id === materias[indiceFilaMateria].id
				),
				materia: materias[indiceFilaMateria],
			},
		});
		indiceFilaMateria++;
	});

	const escuela = window.location.hostname.split(".")[2];
	const ciclo = "importado";

	const diccionarioMateriaIndice = materias.reduce(
		(diccionario, materia, i) => {
			diccionario[materia.id] = i;
			return diccionario;
		},
		{} as Record<string, number>
	);
	return { materias, diccionarioMateriaIndice, encabezados, escuela, ciclo };
};

const actualizarSeleccionDeMaterias = () => {
	const checkboxes = document.querySelectorAll(
		"#ctl00_mainCopy_dbgHorarios input[type=checkbox]"
	) as NodeListOf<HTMLInputElement>;
	console.debug("Materias seleccionadas:", materiasSeleccionadas);
	checkboxes.forEach((checkbox) => {
		const id = checkbox.id.replace("checkbox-", "");
		const materia = materiasSeleccionadas.find((m) => m.id === id);
		if (materia) {
			console.debug("ID de la materia seleccionada:", id);
			checkbox.checked = true;
		} else {
			checkbox.checked = false;
		}
	});
};

export default defineContentScript({
	matches: [CONSTANTES.PATRON_URL_IPN],
	main: async () => {
		// Omitir páginas que no sean saes
		if (!window.location.origin.includes("saes")) return;

		const pathname = window.location.pathname;
		if (pathname.includes(RUTA_HORARIOS_CLASE)) {
			try {
				materiasPagina = procesarTablaHorarios();
				botones();

				materiasSeleccionadas = materiasFromDiccionario(
					(
						await chrome.runtime.sendMessage({
							tipo: MENSAJES.PAGINA_HORARIOS_INIT,
							dato: {},
						})
					).materiasSeleccionadas
				);
				actualizarSeleccionDeMaterias();
			} catch (error) {
				console.error(error);
			}
		} else if (pathname.includes(RUTA_EVALUACION_PROFESOR)) {
			document.querySelectorAll("select").forEach((select) => {
				select.size = 3;
			});
			(
				document.querySelectorAll(
					"select > option"
				) as NodeListOf<HTMLOptionElement>
			).forEach((option) => {
				if (option.value === "" || option.textContent === "") {
					option.remove();
				}
			});
		}
	},
});

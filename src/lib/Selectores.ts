export const SELECTOR_SAES = {
	PERIODO: ["#ctl00_mainCopy_Filtro_lsNoPeriodos", "#mainCopy_Filtro_lsNoPeriodos"],
	TURNO: ["#ctl00_mainCopy_Filtro_cboTurno", "#mainCopy_Filtro_cboTurno"],
	HORARIOS: ["#ctl00_mainCopy_dbgHorarios", "#mainCopy_dbgHorarios", "#regs"],
	MAIN_COPY: ["#copy tbody"],
};

export const buscarCoincidenciaAlgunSelector = (selectores: string[]) => {
	for (const selector of selectores) {
		const elemento = document.querySelector(selector);
		if (elemento) {
			return elemento;
		}
	}
};

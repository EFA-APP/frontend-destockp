export const ObtenerMateriasPrimasApi = () => {
    const respuesta = axiosInitial.get(`/materiasPrima/obtener`, { showLoader: false });
    return respuesta.data;
}
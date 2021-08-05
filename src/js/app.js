//Variable DB vacia
let DB;


const nombrePaciente = document.querySelector('#nombre');
const nombreFamiliar = document.querySelector('#familiar');
const telefonoInfo = document.querySelector('#telefono');
const fechaInfo = document.querySelector('#fecha');
const horaInfo = document.querySelector('#hora');
const sintomasInfo = document.querySelector('#sintomas');

//Selectores partes de division del contenido
const formulario = document.querySelector('.formulario');
const agregarCita = document.querySelector('#citas');

let edicion;
//AddEventListenets

//Ptra forma de cargar el documento
window.onload = function(){
    addEventListeners();

    //Funcion para la base de datos
    crearDB();
}


addEventListeners();
function addEventListeners(){
    nombrePaciente.addEventListener('input', datosCita);
    nombreFamiliar.addEventListener('input', datosCita);
    telefonoInfo.addEventListener('input', datosCita);
    fechaInfo.addEventListener('input', datosCita);
    horaInfo.addEventListener('input', datosCita);
    sintomasInfo.addEventListener('input', datosCita);
    formulario.addEventListener('submit', nuevaCita);

}
const citaObj = {
    nombre:  '',
    familiar: '',
    telefono: '',
    fecha: '',
    hora: '',
    sintomas: ''

}
export function datosCita(e){
    //Le pasamos los valores del objeto
    citaObj[e.target.name] = e.target.value
    //console.log(citaObj);
}

class Citas{
    constructor(){
        //Creamos un arreglo vacio que se ira llenando conforme añademos citas
        this.citas = [];
    }
    agregarCita(cita){
        //Le añadimos las citas con un spread operator
        this.citas = [...this.citas, cita];

    }
    borrarCita(id){
        //Aplicamos un filter para que nos traiga todos excepto a la que demos click
        this.citas = this.citas.filter(cita => cita.id !== id);
 
    }
    editarCita(citaActualizada){
        //En caso de que se reescriba en edicion, y si no, nos la devuelva tal y como esta
        this.citas = this.citas.map(cita => cita.id === citaActualizada.id ? citaActualizada : cita);
    }

}


class UI{

    mensajesAlerta(mensaje, tipo){
        
        const alerta = document.createElement('DIV');
        alerta.textContent = mensaje;
      

        if(tipo === 'error'){
            alerta.classList.add('mensaje-error');
        }
        else{
 
            alerta.classList.add('mensaje-correcto');
        }
        const contenido = document.querySelector('body');
        contenido.appendChild(alerta);

        setTimeout(() => {
            alerta.remove();
        }, 3000);

    }
    mostrarHtml(){

        this.limpiarHtml();
        //Extraemos los datos de la nbase de datos
        const objectStore = DB.transaction('citas').objectStore('citas');
        //iteramos sobre los datos
        objectStore.openCursor().onsuccess = function(e){

            const cursor = e.target.result;

            if(cursor){

                const {nombre, familiar, telefono, fecha, hora, sintomas, id } = cursor.value;

                const divCita = document.createElement('DIV');
                divCita.classList.add('divCita');
                //Le agregamos el id 
                divCita.dataset.id = id;
    
                const nombrePaciente = document.createElement('p');
                nombrePaciente.innerHTML = `<span class="contenido-negrita"> Nombre del paciente: </span > ${nombre}`;
    
                const nameFamiliar = document.createElement('p');
                nameFamiliar.innerHTML = `<span class="contenido-negrita"> Familiar encargado: </span > ${familiar}`;
     
                const numeroTelefono = document.createElement('p');
                numeroTelefono.innerHTML = `<span class="contenido-negrita"> Numero de telefono: </span > ${telefono}`;
    
                const fechaIngreso = document.createElement('p');
                fechaIngreso.innerHTML = `<span class="contenido-negrita"> Fecha de ingresion: </span > ${fecha}`;
    
                const horaIngreso = document.createElement('p');
                horaIngreso.innerHTML = `<span class="contenido-negrita"> Hora de ingresion: </span > ${hora}`;
    
                const sintomasPaciente = document.createElement('p');
                sintomasPaciente.innerHTML = `<span class="contenido-negrita"> Sintomas que presenta: </span > ${sintomas}`;
               
                const btnEliminar = document.createElement('button');
                btnEliminar.textContent = 'Delete';
                btnEliminar.classList.add('boton-eliminar');
    
                //Le pasamos el id por que sera el id a eliminar
                btnEliminar.onclick = () => eliminarCita(id);
    
                const btnEditar = document.createElement('button');
                btnEditar.textContent = "Edit";
                btnEditar.classList.add('boton-eliminar', 'editar');
    
                //Al momento de dar click llamara la funcion
                //Hacemos lo siguiente para modo de que tome la seleccionada
                const cita = cursor.value;
                btnEditar.onclick = () => editarCita(cita);
    
                //Lo añadimos al div    
                divCita.appendChild(nombrePaciente);
                divCita.appendChild(nameFamiliar);
                divCita.appendChild(numeroTelefono);
                divCita.appendChild(fechaIngreso);
                divCita.appendChild(sintomasPaciente);
                divCita.appendChild(btnEliminar);
                divCita.appendChild(btnEditar);
    
                //Lo añadimos al contenedor de citas
                agregarCita.appendChild(divCita);

                //Para que itere sobre los siguientes
                cursor.continue();
            }
        }

        

    }
    //Para que no haya duplicados
    limpiarHtml(){
        while(agregarCita.firstChild){
            agregarCita.removeChild(agregarCita.firstChild);
        }
    }

}
const citas = new Citas();
const ui = new UI();


function nuevaCita(e){
    e.preventDefault();
    
    //Extraemos los valores del objeto
    const {nombre, familiar, telefono, fecha, hora, sintomas} = citaObj;
    //Validamos los inouts
    if(nombre === '' || familiar === '' || telefono === '' || fecha === '' || hora === '' || sintomas === ''){  
        ui.mensajesAlerta('Los campos no pueden ir vacios', 'error');
        return;
    }
    if(edicion){
        
        //Le pasamos una copia del objeto
        citas.editarCita({...citaObj});

        //Edita en index DB
        const transaction = DB.transaction(['citas'], 'readwrite');
        //Accedemos a la base de datos
        const objectStore = transaction.objectStore('citas');
        //Editamos con .put
        objectStore.put(citaObj);

        //Si todo sale correcto
        transaction.oncomplete = function(){
               
            //Mensaje que se agrega en modo edicion
            ui.mensajesAlerta('Se actualizo correctamente');
            formulario.querySelector('button[type="submit"]').textContent = "Crear cita";
            //Pasamos edicion a false
            edicion = false;
        }
        transaction.onerror = function(){
            console.log('No se pudo completar la accion');
        }

        
    }
    else{
        //Le agregamos un Id para poder eliminar
        citaObj.id = Date.now();
        //Mandamos a llamar la funcion
        citas.agregarCita({...citaObj});

        //Agregamos al INDEXdb

        const transaction = DB.transaction(['citas'], 'readwrite');

        //Creamos el objectStore le pasamos nuestra base de datos
        const objectStore = transaction.objectStore('citas');
        //Le agregamos el objeto previo de citaOBJ
        objectStore.add(citaObj);

        //Mensajes de que se agregaron 
        transaction.oncomplete = function(){
            console.log('Agregado correctamente');
            ui.mensajesAlerta('Se agrego correctamente');
        }
    

        
    }
    ui.mostrarHtml();
    //Reiniciamos el objeto
    reiniciarObjeto()
    //Reseteamos el formulario
    formulario.reset();
    //Le pasamos el objeto de citas

  
}

//Reiniciamos el objeto para que no se vuelvan a insertar los mismo datos
export function reiniciarObjeto(){
    citaObj.nombre = '';
    citaObj.familiar = '';
    citaObj.telefono = '';
    citaObj.fecha = '';
    citaObj.hora = '';
    citaObj.sintomas = '';
}
export function eliminarCita(id){
    //Llamamos el metodo que se encargara de eliminar
    const transaction = DB.transaction(['citas'], 'readwrite');
    const objectStore = transaction.objectStore('citas');

    //Eliminamos por id
    objectStore.delete(id);
    
    transaction.oncomplete = function(){
    ui.mensajesAlerta('Se elimino correctamente');
    ui.mostrarHtml();            
    }
    transaction.onerror = function(){
        console.log('No se pudo completar la accion');
    }


}
//Funcion llamada al momento de dar clik en editar
export function editarCita(cita){
    //Extraemos los valores de la cita
    const {nombre, familiar, telefono, fecha, hora, sintomas, id } = cita;

    //Llenamos el formulario con la informacion previa
    nombrePaciente.value = nombre;
    nombreFamiliar.value = familiar;
    telefonoInfo.value = telefono;
    fechaInfo.value = fecha;
    horaInfo.value = hora;
    sintomasInfo.value = sintomas;

    //Llenamos el objeo
    citaObj.nombre = nombre;
    citaObj.familiar = familiar;
    citaObj.telefono = telefono;
    citaObj.fecha = fecha;
    citaObj.hora = hora;
    citaObj.sintomas = sintomas;
    citaObj.id = id;
    
    //Le cambiamos el contenido cuando sea edita
    formulario.querySelector('button[type="submit"]').textContent = 'Guardar los cambios';
    //Ponemos edicion a true
    edicion = true;
    
}
function crearDB(){
    const citasDB = window.indexedDB.open('citas', 1.0);

    citasDB.onerror = function(){
        console.log('Hubo un error');
    }
    citasDB.onsuccess = function(){
        console.log('Se conecto correctamente');

        //Instanciamos la base de datos
        DB = citasDB.result;
        //Para que se muestren las citas al momento de cargar el documento
        ui.mostrarHtml();

    }

    //Definimos el schema
    citasDB.onupgradeneeded = function(e){
        const db = e.target.result;
        
        //Definir el objecstores
        const objectStore = db.createObjectStore('citas',{
            //Ponemos el id por que es el ue ocuparemos para borrarlo despues
            keyPath: 'id',
            autoIncrement: true,
        });

        //Creamos las columnas
        objectStore.createIndex('nombre', 'nombre', {unique: false});
        objectStore.createIndex('familiar', 'familiar', {unique: false});
        objectStore.createIndex('telefono', 'telefono', {unique: false});
        objectStore.createIndex('fecha', 'fecha', {unique: false});
        objectStore.createIndex('hora', 'hora', {unique: false});      
        objectStore.createIndex('sintomas', 'sintomas', {unique: false});      
        objectStore.createIndex('id', 'id', {unique: true});            
        
        console.log('DB creada y lista');
    }
}
import { Component, ViewChild } from '@angular/core';
import { ColaboradorService } from './../../service/colaborador.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { AltaColaboradoresComponent } from '../alta-colaboradores/alta-colaboradores.component';
import { EditarColaboradorComponent } from '../editar-colaborador/editar-colaborador.component';
import { AuthService } from '../../service/auth.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MensajeDesactivarComponent } from "../mensaje-desactivar/mensaje-desactivar.component";
import { IndexedDBService } from './../../service/indexed-db.service';
import { RestablecerContraComponent } from '../restablecer-contra/restablecer-contra.component';

@Component({
  selector: 'app-colaboradores',
  templateUrl: './colaboradores.component.html',
  styleUrls: ['./colaboradores.component.css']
})
export class ColaboradoresComponent {
  public empleados: any;
  public page: number = 0;
  public search: string = '';
  colaborador: any;
  currentUser: string = '';
  idGym: number = 0;
  dataSource: any;
  colaboradores: any;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  isLoading: boolean = true; 
  habilitarBoton: boolean = false;
  
  constructor(private http: ColaboradorService, public dialog: MatDialog, private auth: AuthService, private indexedDBService: IndexedDBService){}

  ngOnInit():void{
    this.auth.comprobar().subscribe((respuesta)=>{ 
      this.habilitarBoton = respuesta.status;
    });
    this.currentUser = this.auth.getCurrentUser();
    if(this.currentUser){
      this.getSSdata(JSON.stringify(this.currentUser));
    }
    this.auth.idGym.subscribe((data) => {
      this.idGym = data;
      this.listaTabla();
    }); 
  }

  loadData() {
    setTimeout(() => {
      this.isLoading = false;
      this.dataSource.paginator = this.paginator;
    }, 1000); 
  }

  listaTabla(){
    if (this.isSupadmin()){
      this.http.listaColaboradores().subscribe({
        next: (resultData) => {
         
          this.empleados = resultData;
        }
      });
    } 
    if (this.isAdmin()){
      this.http.MostrarRecepcionistas(this.idGym).subscribe({
        next: (dataResponse) => {
          this.empleados = dataResponse;
          this.dataSource = new MatTableDataSource(this.empleados);
          this.loadData(); 
        }
      })
    }
  }

  getSSdata(data: any){
    this.auth.dataUser(data).subscribe({
      next: (resultData) => {
        this.auth.loggedIn.next(true);
          this.auth.role.next(resultData.rolUser);
          this.auth.idUser.next(resultData.clave);
          this.auth.idGym.next(resultData.idGym);
          this.auth.nombreGym.next(resultData.direccion);
          this.auth.email.next(resultData.email);
          this.auth.encryptedMail.next(resultData.encryptedMail);
      }, error: (error) => { console.log(error); }
    });
  }

  isAdmin(): boolean {
    return this.auth.isAdmin();
  }
  
  isSupadmin(): boolean {
    return this.auth.isSupadmin();
  }

  onSearchPokemon( search: Event ) {
    const filterValue = (search.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  OpenAgregar() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '70%';
    //dialogConfig.height = '90%';
    dialogConfig.disableClose = true;
    this.dialog.open(AltaColaboradoresComponent, dialogConfig)
      .afterClosed()
      .subscribe((cerrarDialogo: Boolean) => {
        if (cerrarDialogo) {
          this.listaTabla();
        } else {
        }
      });
  }

  OpenRestablecer(empleados: any) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '70%';
    dialogConfig.disableClose = true; // Evita que el diálogo se cierre haciendo clic fuera de él
    dialogConfig.data = empleados;
    dialogConfig.disableClose = true;
    this.dialog.open(RestablecerContraComponent, dialogConfig)
      .afterClosed()
      .subscribe((cerrarDialogo: Boolean) => {
        if (cerrarDialogo) {
          this.listaTabla();
        } else {
        }
      });
  }
  
  OpenEditar(empleados: any) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '70%';
    //dialogConfig.height = '90%';
    dialogConfig.disableClose = true; // Evita que el diálogo se cierre haciendo clic fuera de él
    dialogConfig.data = {
      empleadoID: `${empleados.id_empleado}`
    };
    this.dialog.open(EditarColaboradorComponent, dialogConfig)
      .afterClosed()
      .subscribe((cerrarDialogo: Boolean) => {
        if (cerrarDialogo) {
          this.listaTabla();
        } else {
        }
      });
  }

  onToggle(event: Event, idEmpleado: any, correo:any) {
    let colab = this.empleados.find(
      (e: { id_empleado: any }) => e.id_empleado == idEmpleado
    );
    let mensaje =
    colab.estatus == 1
        ? "¿Deseas desactivar esta sucursal?"
        : "¿Deseas activar esta sucursal?";
    const dialogRef = this.dialog.open(MensajeDesactivarComponent, {
      data: { mensaje: mensaje, idEmpleado: colab },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const nuevoEstatus = colab.estatus == 1 ? 0 : 1;
        // Actualizar la base de datos y refrescar los datos
        this.http
          .actualizarEstatus(idEmpleado, nuevoEstatus, correo)
          .subscribe(
            (response) => {
              if (response && response.success === 1) {
                colab.estatus = nuevoEstatus;
              } else if (response) {
                console.error(
                  "Error al actualizar el estatus: ",
                  response.error
                );
              } else {
                console.error("Error: la respuesta es null");
              }
            },
            (error) => {
              console.error("Error en la petición: ", error);
            }
          );
      } else {
      }
    });
  }

  Sincronizar() {
      this.indexedDBService.getAgregarEmpleadoData('AgregarEmpleado').then(data => {
        if (data && data.length > 0) {
          let maxId = -1;
          let lastData: any;
          data.forEach((record: any) => {
            this.http.agregarEmpleado(record.data).subscribe({
            });
          });
          this.indexedDBService.VaciarAgregarEmpleadoData();
          this.listaTabla();
          //observer.next(lastData); // Emitir el último dato encontrado
        } else {
          console.log("No hay datos"); 
        }
      });
   }
}

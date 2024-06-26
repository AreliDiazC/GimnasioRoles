import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { caja } from '../models/caja';

@Injectable({
  providedIn: 'root'
})
export class listarClientesService {

  API: string = 'https://olympus.arvispace.com/gimnasioRoles/configuracion/recepcion/ListaCliente.php'
  
  constructor(private clienteHttp:HttpClient) {
  }

  obternerCliente(){
    return this.clienteHttp.get(this.API)
  }

  consultarCliente(id:any):Observable<any>{
    return this.clienteHttp.get(this.API+"?consultar="+id);
  }
}

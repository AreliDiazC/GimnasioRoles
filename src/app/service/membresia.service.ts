
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map , throwError} from 'rxjs';
import { membresia } from '../models/membresia';
import { catchError } from 'rxjs/operators';
import { ConnectivityService } from './connectivity.service';

@Injectable({
  providedIn: 'root'
})
export class MembresiaService {

  isConnected: boolean = true;

  //API: string ="https://olympus.arvispace.com/olimpusGym/conf/" 

  APIv2: string = 'https://olympus.arvispace.com/olimpusGym/conf/';
  APIv3: string = 'http://localhost/olimpusGym/conf/';
  API: String = '';
  
  constructor(private clienteHttp:HttpClient, private connectivityService: ConnectivityService) {
  }

  comprobar(){
    this.connectivityService.checkInternetConnectivity().subscribe((isConnected: boolean) => {
      this.isConnected = isConnected;
      if (isConnected) {
        //console.log("La red WiFi tiene acceso a Internet.");
        this.API = this.APIv2;
      } else {
        //console.log("La red WiFi no tiene acceso a Internet.");
        this.API = this.APIv3;
      }
    });
  }

  private datosPlan: any;
  data: any = {};

  /////////////////////************************Membresia */
  agregarMem(datosPlan:any):Observable<any>{
    return this.clienteHttp.post(this.API+"membresias.php?insertar",datosPlan);
  }

  updateMembresia(formData: any): Observable<any>{ 
    return this.clienteHttp.put(this.API+"membresias.php", formData);
  }

  updateMembresiaStatus(id: number, estado: { status: number }): Observable<any> {
    return this.clienteHttp.post(this.API+"membresias.php?actualizarEstatus="+id,estado);
  }

  consultarPlanGym(id:any):Observable<any>{
    return this.clienteHttp.get(this.API+"membresias.php?consultarMembresia="+id);
  }


  //////////******************PLAN */
  public optionShow: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  public showServices: BehaviorSubject<any> = new BehaviorSubject<any>([]);
  public dataToUpdate: BehaviorSubject<any> = new BehaviorSubject<any>({});
  public section: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  agregarPlan(datosPlan:membresia):Observable<any>{
    return this.clienteHttp.post(this.API+"membresias.php?insertarplan",datosPlan);
  }

  consultarPlanIdMem(id:any):Observable<any>{
    return this.clienteHttp.get(this.API+"membresias.php?consultarGYMMem="+id);
  }

  consultarPlanIdPlan2(id:any):Observable<any>{
    return this.clienteHttp.get(this.API+"membresias.php?consultarGYMPlanT="+id);
  }

  setDataToupdate(id:number, tipo_membresia: number){
    this.data = {
     id: id,
     tipo_membresia: tipo_membresia
   }
   if(this.data){
     this.dataToUpdate.next(this.data);
   }
   }

   getDataToUpdate(): Observable<any> {
    return this.dataToUpdate.asObservable();
  }

  consultarPlan(id:any):Observable<any>{
    return this.clienteHttp.get(this.API+"membresias.php?consultarPlanes="+id);
  }

  agregarPlanMem(datosPlanM:any):Observable<any>{
    return this.clienteHttp.post(this.API+"membresias.php?insertarPlanM",datosPlanM);
  }

  consultarPlanId(id:any):Observable<any>{
    return this.clienteHttp.get(this.API+"membresias.php?consultarGYM="+id);
  }

  actualizarPlan(id:any,datosPlan:any):Observable<any>{
    console.log(id, "id", datosPlan, "datos");
    return this.clienteHttp.post(this.API+"membresias.php?actualizarPlan="+id,datosPlan);
  }  

}

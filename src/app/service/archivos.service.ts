import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ArchivoService {

API: string = 'https://olympus.arvispace.com/olimpusGym/conf/'

constructor(private clienteHttp: HttpClient) {
}

guardarArchivos(formData: FormData) {
  return this.clienteHttp.post(this.API+"archivos.php", formData);
}

}
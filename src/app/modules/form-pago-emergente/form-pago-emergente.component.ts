import { Component, OnInit, Inject, EventEmitter, Output } from "@angular/core";
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog,
} from "@angular/material/dialog";
import { PagoMembresiaEfectivoService } from "../../service/pago-membresia-efectivo.service";
import { MensajeEmergenteComponent } from "../mensaje-emergente/mensaje-emergente.component";
import { ToastrService } from "ngx-toastr";
import { GimnasioService } from "../../service/gimnasio.service";
import { AuthService } from "../../service/auth.service";
import { NgxSpinnerService } from "ngx-spinner";
import { MensajeAceptarComponent } from "../mensaje-aceptar/mensaje-aceptar.component";
import { MatDialogConfig } from "@angular/material/dialog";

@Component({
  selector: "app-form-pago-emergente",
  templateUrl: "./form-pago-emergente.component.html",
  styleUrls: ["./form-pago-emergente.component.css"],
})
export class FormPagoEmergenteComponent implements OnInit {
  idSucursal: number = 0;
  membresias: any[] = [];
  membresiaSeleccionada: any;
  precioSeleccionado: any;
  idMembresiaSelec: any;
  nombreMembresia: any;
  precio: any;
  duracion: number = 0;
  moneyRecibido: number = 0;
  fechaDeInicio: Date | null = null;
  fechaDeFin: Date | null = null;
  ticketInfo: any;
  @Output() actualizarTablas = new EventEmitter<boolean>();

  constructor(
    private toastr: ToastrService,
    private auth: AuthService,
    public dialog: MatDialog,
    private spinner: NgxSpinnerService,
    private GimnasioService: GimnasioService,
    @Inject(MAT_DIALOG_DATA)
    public data: any,
    private membresiaService: PagoMembresiaEfectivoService,
    public dialogo: MatDialogRef<FormPagoEmergenteComponent>
  ) {
    this.obtenerFoto();
  }

  private fotoUrl: string | null = null;

  ngOnInit(): void {
    this.precio = 0;
    this.getMembresiasLista(this.data.idSucursal);
    if (this.data) {
      this.membresiaSeleccionada = this.data.idMem;
      this.precio = this.data.precio !== "null" ? this.data.precio : "N/A";
      this.duracion =
        this.data.duracion !== "null" ? this.data.duracion : "N/A";
    }
  }

  getMembresiasLista(idgimnasio: number): void {
    this.membresiaService.membresiasLista(idgimnasio).subscribe(
      (data) => {
        this.membresias = data;
      },
      (error) => {
        console.error("Error al obtener la lista de membresías:", error);
      }
    );
  }

  onMembresiaChange(): void {
    this.membresiaService
      .membresiasInfo(this.membresiaSeleccionada)
      .subscribe((resultado) => {
        this.duracion = resultado.Duracion;
        this.precio = `${resultado.Precio}`;
        this.nombreMembresia = `${resultado.Membresia}`;
      });
  }

  cancelDialogo(): void {
    this.dialogo.close(true);
  }

  convertirNumeroAPalabrasPesos(numero: number): string {
    const unidades = [
      "CERO",
      "UN",
      "DOS",
      "TRES",
      "CUATRO",
      "CINCO",
      "SEIS",
      "SIETE",
      "OCHO",
      "NUEVE",
    ];
    const decenas = [
      "DIEZ",
      "ONCE",
      "DOCE",
      "TRECE",
      "CATORCE",
      "QUINCE",
      "DIECISEIS",
      "DIECISIETE",
      "DIECIOCHO",
      "DIECINUEVE",
    ];
    const decenasCompuestas = [
      "VEINTE",
      "TREINTA",
      "CUARENTA",
      "CINCUENTA",
      "SESENTA",
      "SETENTA",
      "OCHENTA",
      "NOVENTA",
    ];
    const centenas = [
      "CIENTO",
      "DOSCIENTOS",
      "TRESCIENTOS",
      "CUATROCIENTOS",
      "QUINIENTOS",
      "SEISCIENTOS",
      "SETECIENTOS",
      "OCHOCIENTOS",
      "NOVECIENTOS",
    ];

    const decimales = [
      "CERO",
      "UN",
      "DOS",
      "TRES",
      "CUATRO",
      "CINCO",
      "SEIS",
      "SIETE",
      "OCHO",
      "NUEVE",
    ];

    const miles = "MIL";
    const millones = "MILLÓN";
    const millonesPlural = "MILLONES";

    let palabras = "";
    const entero = Math.floor(numero);
    const decimal = Math.round((numero - entero) * 100); // Obtiene los dos decimales

    if (numero === 0) {
      palabras = "CERO";
    } else if (numero < 10) {
      palabras = unidades[numero];
    } else if (numero < 20) {
      palabras = decenas[numero - 10];
    } else if (numero < 100) {
      palabras = decenasCompuestas[Math.floor(numero / 10) - 2];
      if (numero % 10 !== 0) palabras += ` Y ${unidades[numero % 10]}`;
    } else if (numero < 1000) {
      palabras = centenas[Math.floor(numero / 100) - 1];
      if (numero % 100 !== 0)
        palabras += ` ${this.convertirNumeroAPalabrasPesos(numero % 100)}`;
    } else if (numero < 10000) {
      palabras = unidades[Math.floor(numero / 1000)] + ` ${miles}`;
      if (numero % 1000 !== 0)
        palabras += ` ${this.convertirNumeroAPalabrasPesos(numero % 1000)}`;
    } else if (numero < 1000000) {
      palabras =
        this.convertirNumeroAPalabrasPesos(Math.floor(numero / 1000)) +
        ` ${miles}`;
      if (numero % 1000 !== 0)
        palabras += ` ${this.convertirNumeroAPalabrasPesos(numero % 1000)}`;
    } else {
      palabras = "Número demasiado grande";
    }

    return palabras;
  }

  obtenerFoto() {
    this.GimnasioService.consultarFoto(this.auth.idGym.getValue()).subscribe(
      (respuesta) => {
        if (respuesta && respuesta[0] && respuesta[0].foto) {
          let fotoUrl = respuesta[0].foto;
          // Añadir el esquema si no está presente
          if (!/^https?:\/\//i.test(fotoUrl)) {
            fotoUrl = "https://" + fotoUrl;
          }
          this.fotoUrl = fotoUrl;
        }
      },
      (error) => {
        console.error("Error al obtener la foto:", error);
        this.fotoUrl = null;
      }
    );
  }

  imprimirResumen() {
    if (this.precio <= this.moneyRecibido) {
      const PrecioCalcular = this.moneyRecibido - this.precio;
      this.membresiaService
        .ticketPagoInfo(this.data.idCliente)
        .subscribe((respuesta) => {
          if (respuesta && respuesta.length > 0) {
            const ticketInfo = respuesta[0];
            const totalEnPesos = this.convertirNumeroAPalabrasPesos(
              this.precio
            );
            const totalEnPesosRecibido = this.convertirNumeroAPalabrasPesos(
              this.moneyRecibido
            );
            const totalEnPesosCambio =
              this.convertirNumeroAPalabrasPesos(PrecioCalcular);
            const ventanaImpresion = window.open("", "_blank");
            const fechaActual = new Date().toLocaleDateString("es-MX"); // Obtener solo la fecha en formato local de México
            const horaActual = new Date().toLocaleTimeString("es-MX", {
              hour: "2-digit",
              minute: "2-digit",
            }); // Obtener solo la hora en formato local de México
            if (ventanaImpresion) {
              ventanaImpresion.document.open();
              ventanaImpresion.document.write(`
              <html>
                <head>
                  <style>
                    body {
                      font-family: 'Arial', sans-serif;
                      margin: 0;
                      padding: 0;
                      background-color: #f5f5f5;
                    }
                    .ticket {
                      width: 80%;
                      max-width: 600px;
                      margin: 20px auto;
                      background-color: #fff;
                      border-radius: 4px;
                      padding: 20px;
                    }

                    h1 {
                      text-align: center;
                      color: #333;
                      margin-bottom: 20px;
                    }
                    table {
                      width: 100%;
                      border-collapse: collapse;
                      margin-bottom: 20px;
                    }
                    th, td {
                      padding: 8px;
                      border-bottom: 1px solid #ddd;
                      text-align: left;
                    }
                    th {
                      background-color: #f2f2f2;
                    }
                    .total {
                      text-align: right;
                      margin-top: 20px;
                      font-weight: bold;
                    }
                    .total p {
                      margin: 5px 0;
                      font-size: 1.1em;
                    }
                    hr {
                      border: none;
                      border-top: 1px dashed #ccc;
                      margin: 20px 0;
                    }
                    .brand {
                      text-align: center;
                      color: #888;
                      font-size: 20px;
                      margin-top: 20px;
                    }
                    .fecha-hora {
                      display: flex;
                      justify-content: space-between;
                    }
                    .logo {
                      display: block;
                      margin: 0 auto 20px;
                      max-width: 150px;
                      width: 100%;
                      height: auto;
                    }
                    .direccion{
                     font-size: 0.8em;
                    text-align: center;
                    }
                  </style>
                </head>
                <body> 
                <div class="ticket">
                ${
                  this.fotoUrl
                    ? `<img class="logo" src="${this.fotoUrl}" alt="Logo">`
                    : ""
                }
                <p class="direccion">${this.auth.nombreGym.getValue()}</p>
                    <table>
                      <thead>
                        <tr>
                          <th>Nombre</th>
                          <th>Sucursal</th>
                          <th>Membresia</th>
                          <th>Fecha Inicio</th>
                          <th>Fecha Fin</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                            <tr>
                              <td>${ticketInfo.Nombre}</td>
                              <td>${ticketInfo.Sucursal}</td>
                              <td>${ticketInfo.Membresia}</td>
                              <td>${ticketInfo.Fecha_Inicio}</td>
                              <td>${ticketInfo.Fecha_Fin}</td>
                              <td>$${ticketInfo.Precio}</td>
                            </tr> 
                      </tbody>
                    </table>
                    <hr>
                    <div>
                      <p>(${totalEnPesos} PESOS)</p>
                      <div class="total">
                        <p>Total a Pagar: $${this.precio}</p>
                      </div>
                    </div>
                    <div>
                      <div class="total">
                        <p>Dinero recibido: $${this.moneyRecibido}</p>
                        <p>Cambio: $${PrecioCalcular}</p>
                      </div>
                    </div>
                    <div class="fecha-hora">
                      <p>Fecha: ${fechaActual}</p> <!-- Fecha -->
                      <p>Hora: ${horaActual}</p> <!-- Hora -->
                    </div>
                    <div class="brand">
                      <p>Gracias por su compra</p>
                      <p>¡Vuelva pronto!</p>
                    </div>
                  </div>
                </body>
              </html>
            `);
              ventanaImpresion.document.close();

              // Esperar a que la imagen se cargue antes de imprimir
              const image: HTMLImageElement | null =
                ventanaImpresion.document.querySelector("img");
              if (image) {
                image.onload = () => {
                  ventanaImpresion.print();
                  ventanaImpresion.close();
                };

                image.onerror = (error) => {
                  console.error("Error al cargar la imagen:", error);
                  ventanaImpresion.print();
                  ventanaImpresion.close();
                };
              } else {
                ventanaImpresion.print();
                ventanaImpresion.close();
              }
            }
          } else {
            console.error(
              "La respuesta del servicio no contiene los datos necesarios para generar el ticket."
            );
          }
        });
    } else {
      this.toastr.error("Ingresa el pago");
    }
  }

  successDialog() {
    if (this.moneyRecibido >= this.precio) {
    this.spinner.show();
    this.onMembresiaChange();
    setTimeout(() => {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.width = "30%"; // Ajusta el ancho del diálogo
      dialogConfig.height = "auto"; // Ajusta la altura del diálogo, 'auto' para ajustar según el contenido
      dialogConfig.disableClose = true; // Opcional: Deshabilita el cierre del diálogo al hacer clic fuera de él
      dialogConfig.data = {
        mensaje: `¿Está seguro/a de que desea pagar la membresía seleccionada?`,
        cliente: this.data.nombre,
        membresia: this.nombreMembresia,
      };

      this.dialog
        .open(MensajeAceptarComponent, dialogConfig)
        .afterClosed()
        .subscribe((confirmado: boolean) => {
          if (confirmado) {
            if (this.membresiaSeleccionada != undefined) {
                const PrecioCalcular = this.moneyRecibido - this.precio;

                if (this.fechaDeInicio && this.fechaDeFin) {
                  const añoInicio = this.fechaDeInicio.getFullYear();
                  const mesInicio = String(
                    this.fechaDeInicio.getMonth() + 1
                  ).padStart(2, "0"); // Los meses son indexados desde 0
                  const díaInicio = String(
                    this.fechaDeInicio.getDate()
                  ).padStart(2, "0");
                  const fechaFormateada1 = `${añoInicio}-${mesInicio}-${díaInicio}`;

                  const añoFin = this.fechaDeInicio.getFullYear();
                  const mesFin = String(
                    this.fechaDeInicio.getMonth() + 1
                  ).padStart(2, "0");
                  const díaFin = String(this.fechaDeInicio.getDate()).padStart(
                    2,
                    "0"
                  );
                  const fechaFormateada2 = `${añoFin}-${mesFin}-${díaFin}`;
                  this.membresiaService
                    .actualizacionMemebresia(
                      this.data.idCliente,
                      this.membresiaSeleccionada,
                      fechaFormateada1,
                      this.data.detMemID,
                      this.precio,
                      fechaFormateada2,
                      this.auth.idUser.getValue()
                    )
                    .subscribe((dataResponse: any) => {
                      this.spinner.hide();
                      this.actualizarTablas.emit(true);
                      this.dialogo.close(true);
                      this.dialog
                        .open(MensajeEmergenteComponent, {
                          data: `Pago exitoso, el cambio es de: $${PrecioCalcular}`,
                          disableClose: true, // Bloquea el cierre haciendo clic fuera del diálogo
                        })
                        .afterClosed()
                        .subscribe((cerrarDialogo: Boolean) => {
                          if (cerrarDialogo) {
                            this.imprimirResumen();
                          } else {
                          }
                        });
                    });
                } else {
                  const fechaActual: Date = new Date();
                  const year = fechaActual.getFullYear();
                  const month = String(fechaActual.getMonth() + 1).padStart(
                    2,
                    "0"
                  );
                  const day = String(fechaActual.getDate()).padStart(2, "0");
                  const fechaFormateada = `${year}-${month}-${day}`;
                  let fechaFin: Date = new Date(fechaActual);
                  if (this.duracion == 1) {
                  } else if (this.duracion == 30) {
                    fechaFin.setMonth(fechaFin.getMonth() + 1);
                    if (fechaFin.getMonth() == 0) {
                      fechaFin.setFullYear(fechaFin.getFullYear() + 1);
                    }
                    fechaFin.setDate(fechaFin.getDate() - 1);
                  } else {
                    this.duracion = Number(this.duracion);
                    fechaFin.setDate(fechaFin.getDate() + this.duracion - 1);
                  }

                  const fechaFormateadaFin: string = fechaFin
                    .toISOString()
                    .split("T")[0];

                  this.membresiaService
                    .actualizacionMemebresia(
                      this.data.idCliente,
                      this.membresiaSeleccionada,
                      fechaFormateada,
                      this.data.detMemID,
                      this.precio,
                      fechaFormateadaFin,
                      this.auth.idUser.getValue()
                    )
                    .subscribe((dataResponse: any) => {
                      this.spinner.hide();
                      this.actualizarTablas.emit(true);

                      this.dialogo.close(true);

                      this.dialog
                        .open(MensajeEmergenteComponent, {
                          data: `Pago exitoso, el cambio es de: $${PrecioCalcular}`,
                          disableClose: true, // Bloquea el cierre haciendo clic fuera del diálogo
                        })
                        .afterClosed()
                        .subscribe((cerrarDialogo: Boolean) => {
                          if (cerrarDialogo) {
                            this.imprimirResumen();
                          } else {
                          }
                        });
                    });
                } 
            }
          } else {
            this.spinner.hide();
          }
        });
    }, 2000);
  } else {
    this.spinner.hide();
    this.toastr.error(
      "Cantidad suficiente para cubrir el costo de esta membresía.",
      "¡Error!"
    );
  }
  }
}

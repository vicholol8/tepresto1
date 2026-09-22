import { Injectable, signal } from '@angular/core';

export interface Items {
  id: number;
  nombre: string;
  tipo: string;
  precio: string;
  depto: string;
  dueno: string;
  descripcion: string;
  foto: string;
  arrendado: boolean;
}

@Injectable({ providedIn: 'root' })
export class ItemService {
  private items = signal<Items[]>([
    {
      id: 1, nombre: 'Taladro Bosch', tipo: 'Herramienta', precio: '$5000', depto: 'dpto 203',
      dueno: 'Carlos P.', descripcion: 'Taladro bosch con 1 año de uso. Buen estado',
      foto: 'https://imgs.search.brave.com/ttRIiCDV7sZp0QUG7Rd0vscjsAfdYEidlf55THExLi4/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pLmVi/YXlpbWcuY29tL2lt/YWdlcy9nL3hMd0FB/ZVN3aUNKcWo5ci0v/cy1sNDAwLndlYnA', arrendado: false,
    },
    {
      id: 2, nombre: 'Proyector HD', tipo: 'Tecnología', precio: '$15000', depto: 'dpto 401',
      dueno: 'María G.', descripcion: 'Proyector para ver pelicas, televisión, etc. Buen estado',
      foto: 'https://imgs.search.brave.com/ZczcuayOUBObUv3_0zqkwTii7_IAS3vi9QhQApIFrGg/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pLmVi/YXlpbWcuY29tL3Ro/dW1icy9pbWFnZXMv/Zy9GOFFBQU9Td3d1/RmtRWlBBL3MtbDQw/MC53ZWJw', arrendado: false,
    },
    {
      id: 3, nombre: 'Carpa camping', tipo: 'Camping', precio: '$25000', depto: 'dpto 101',
      dueno: 'Javiera L.', descripcion: 'Buen estado',
      foto: 'https://imgs.search.brave.com/hbfkVIAOiqwCPBphNMWzIbCgnl553l4SEZgDu4ZXpk0/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9ib3Nz/Y2FtcC5jbC9jZG4v/c2hvcC9maWxlcy9D/YXJwYV9DYW1waW5n/X1F1aW50YXlfNF9Q/ZXJzb25hc18zMDAw/X01tX0N1YnJlX1Rl/Y2hvX0xhcmdvXy1f/My5qcGc_dj0xNzYy/ODg2MzcwJndpZHRo/PTUzMw', arrendado: true,
    },
    {
      id: 4, nombre: 'Escalera 5m', tipo: 'Herramientas', precio: '$8000', depto: 'dpto 802',
      dueno: 'Roberto S.', descripcion: 'Escalera firme y en buen estado',
      foto: 'https://imgs.search.brave.com/fOLv2SDM2PEqyYmMlvLXwAsep-qJEiz3HwhJ_p_S68w/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/NDFmelJhNDRJRVMu/anBn', arrendado: true,
    },
    {
      id: 5, nombre: 'Hervidor para fiestas', tipo: 'Cocina', precio: '$4000', depto: 'dpto 701',
      dueno: 'Ana M.', descripcion: 'Hervidor con capacidad de 30 litros para fiestas',
      foto: 'https://imgs.search.brave.com/T-ez2sWXBm4gK2aiXn_wV-d9eyb3XdgCtwkvOo6RgIE/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zdGV3/YXJkLmNsLzU0MTIt/aG9tZV9kZWZhdWx0/L2hlcnZpZG9yLWRl/LWFndWEtMzAtbGl0/cm9zLWJpZy1jaGVm/LmpwZw', arrendado: false,
    },
    {
      id: 6, nombre: 'Mini cooler', tipo: 'Cocina', precio: '$3000', depto: 'dpto 606',
      dueno: 'Diego F.', descripcion: 'Mini cooler para poner bebidas, cervezas, etc. Buen estado y no descongela rápidamente',
      foto: 'https://imgs.search.brave.com/11nTnnMvk_UWveYk9Ynv7tP942fOwuEN9QiJx4OtBCQ/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/a29vbGF0cm9uLmNv/bS9jZG4vc2hvcC9w/cm9kdWN0cy9jb2Nh/X2NvbGFfZmFudGFf/bWluaV9mcmlkZ2Vf/Nl9jYW5fY29vbGVy/X2FuZF93YXJtZXJf/MTAuanBnP3Y9MTY2/ODcwMzcxMSZ3aWR0/aD0yMDAw', arrendado: true,
    },
  ]);

  todas(): Items[] {
    return this.items();
  }

  obtener(id: String): Items | undefined {
    return this.items().find(i => i.id === Number(id));
  }

  agregar(item: Items): void {
    const idAlto = Math.max(...this.items().map(i => i.id));
    item.id = idAlto +1
    this.items.update(listac => [...listac, item]);
  }

  adoptar(id: String) {
    this.items.update(lista => lista.map(item => item.id == Number(id) ? { ...item, arrendado: true} : item));
  }

  editar(item: Items) {
    this.items.update(lista => lista.map(i => i.id === item.id ? item : i));
  }

  eliminar(id: String) {
    this.items.update(lista => lista.filter(i => i.id !== Number(id)));
  }
}

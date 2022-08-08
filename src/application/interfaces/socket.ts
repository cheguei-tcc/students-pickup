import { Responsible } from '../../domain/responsible';

interface Socket {
  getResponsibleSocketId: (responsible: Responsible) => Promise<string>;
  emit: (event: string, data: any) => Promise<void>;
}

export { Socket };

import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEvents } from '../../hooks/useEvents';
import { eventService } from '../../services/eventService';
import { EventCard } from './EventCard';
import { Button } from '../common/Button';
import { useState } from 'react';
import { Event } from '../../types/event';
import { Modal } from '../common/Modal';
import { EventForm } from './EventForm';
import FirestoreDebug from '../debug/FirestoreDebug';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xl};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const Title = styled.h1`
  margin: 0;
  color: ${({ theme }) => theme.text};
  font-size: 2rem;
  font-weight: 600;
`;

const FiltersContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.xl};
`;

const LoadingContainer = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  color: ${({ theme }) => theme.text};
  font-size: 1.25rem;
`;

const ErrorContainer = styled(motion.div)`
  text-align: center;
  color: ${({ theme }) => theme.danger};
  padding: ${({ theme }) => theme.spacing.xl};
`;

const NoEventsContainer = styled(motion.div)`
  text-align: center;
  color: ${({ theme }) => theme.text};
  opacity: 0.6;
  padding: ${({ theme }) => theme.spacing.xl};
`;

export const EventList = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const { data: eventsData, isLoading, isError, refetch } = useEvents();

  // Filtrar eventos según el filtro de estado
  const allEvents = eventsData?.data || [];
  const filteredEvents = allEvents.filter(event => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'active') return event.activo;
    if (statusFilter === 'inactive') return !event.activo;
    return true;
  });

  // Paginación
  const eventsPerPage = 10;
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);
  const startIndex = (page - 1) * eventsPerPage;
  const paginatedEvents = filteredEvents.slice(startIndex, startIndex + eventsPerPage);

  const queryClient = useQueryClient();

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, currentStatus }: { id: string; currentStatus: 'active' | 'inactive' }) =>
      eventService.toggleEventStatus(id, currentStatus === 'active' ? 'inactive' : 'active'),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event', id] });
    }
  });

  const handleOpenModal = (event?: Event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
    setIsModalOpen(false);
  };

  const handleToggleStatus = (event: Event) => {
    toggleStatusMutation.mutate({
      id: event.id,
      currentStatus: event.activo ? 'active' : 'inactive'
    });
  };

  const handleShare = (event: Event) => {
    const url = `${window.location.origin}/evento/${event.id}`;
    navigator.clipboard.writeText(url);
    // Aquí podrías mostrar una notificación de éxito
  };

  if (isLoading) {
    return (
      <LoadingContainer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        Cargando eventos...
      </LoadingContainer>
    );
  }

  if (isError) {
    return (
      <ErrorContainer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        Error al cargar los eventos. Por favor, intenta de nuevo.
      </ErrorContainer>
    );
  }

  return (
    <Container>
      <Header>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Title>Eventos</Title>
          <Button
            variant="primary"
            onClick={() => handleOpenModal()}
          >
            Crear Evento
          </Button>
        </div>
        <FiltersContainer>
          <Button
            variant={statusFilter === 'all' ? 'primary' : 'ghost'}
            onClick={() => setStatusFilter('all')}
          >
            Todos
          </Button>
          <Button
            variant={statusFilter === 'active' ? 'primary' : 'ghost'}
            onClick={() => setStatusFilter('active')}
          >
            Activos
          </Button>
          <Button
            variant={statusFilter === 'inactive' ? 'primary' : 'ghost'}
            onClick={() => setStatusFilter('inactive')}
          >
            Inactivos
          </Button>
        </FiltersContainer>
      </Header>

      {paginatedEvents.length === 0 ? (
        <NoEventsContainer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          No hay eventos para mostrar
        </NoEventsContainer>
      ) : (
        <Grid>
          <AnimatePresence mode="popLayout">
            {paginatedEvents.map(event => (
              <EventCard
                key={event.id}
                event={event}
                onEdit={() => handleOpenModal(event)}
                onToggleStatus={handleToggleStatus}
                onShare={handleShare}
              />
            ))}
          </AnimatePresence>
        </Grid>
      )}

      {totalPages > 1 && (
        <PaginationContainer>
          <Button
            variant="ghost"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Anterior
          </Button>
          <span>
            Página {page} de {totalPages}
          </span>
          <Button
            variant="ghost"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Siguiente
          </Button>
        </PaginationContainer>
      )}

      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <EventForm
          event={selectedEvent}
          onClose={handleCloseModal}
        />
      </Modal>
    </Container>
  );
};
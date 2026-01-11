import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PogoEvent } from '../types';
import EventDetail from './EventDetail';
import Catalog from './Catalog';

interface WrapperProps {
    events: PogoEvent[];
}

export const EventDetailWrapper = ({ events }: WrapperProps) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const event = events.find(e => e.id === id);

    if (!event) {
        return <div className="p-10 text-center">Evento não encontrado</div>;
    }

    return (
        <EventDetail
            event={event}
            onBack={() => navigate('/')}
            onOpenCatalog={() => navigate(`/event/${event.id}/catalog`)}
        />
    );
};

export const CatalogWrapper = ({ events }: WrapperProps) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const event = events.find(e => e.id === id);

    if (!event) {
        return <div className="p-10 text-center">Evento não encontrado</div>;
    }

    return (
        <Catalog
            event={event}
            onBack={() => navigate(`/event/${event.id}`)}
        />
    );
};

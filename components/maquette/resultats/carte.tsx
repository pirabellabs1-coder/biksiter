'use client';

import 'leaflet/dist/leaflet.css';

import { useEffect, useRef } from 'react';

/**
 * La carte des résultats, sur fond OpenStreetMap.
 *
 * Règle 4 : l'adresse exacte n'existe qu'après acceptation. Ce que la carte
 * reçoit n'est jamais le point du bike sitter, mais le centre de sa zone,
 * déjà arrondi en base sur une grille d'un demi-centième de degré. On y
 * dessine un cercle de trois cents mètres : c'est la zone, et rien d'autre.
 * Aucun marqueur ponctuel, qui laisserait croire à une adresse.
 */

export type ZoneAffichee = {
  reference: string;
  nom: string;
  quartier: string;
  distance: string;
  latitude: number;
  longitude: number;
};

const RAYON_DE_LA_ZONE_METRES = 300;

export function CarteDesZones({
  zones,
  destination,
  choisi,
  satellite = false,
}: {
  zones: readonly ZoneAffichee[];
  destination: { latitude: number; longitude: number } | null;
  choisi?: string | null;
  satellite?: boolean;
}) {
  const conteneur = useRef<HTMLDivElement>(null);
  // Leaflet vit hors de React : on garde la carte pour la défaire au départ.
  const carte = useRef<import('leaflet').Map | null>(null);

  useEffect(() => {
    let vivant = true;
    let instance: import('leaflet').Map | null = null;

    // Leaflet touche `window` dès l'import : on ne le charge qu'au montage.
    import('leaflet').then((L) => {
      if (!vivant || !conteneur.current || carte.current) return;

      const centre = destination ??
        zones[0] ?? { latitude: 50.8467, longitude: 4.3528 };

      instance = L.map(conteneur.current, {
        center: [centre.latitude, centre.longitude],
        zoom: 13,
        zoomControl: false,
        attributionControl: true,
      });
      carte.current = instance;

      L.tileLayer(
        satellite
          ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
          : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          maxZoom: 18,
          attribution: satellite
            ? '© Esri'
            : '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        },
      ).addTo(instance);

      // La destination : un point discret, pas une épingle d'adresse. À
      // l'encre, pas en corail : le corail dit une erreur (règle 6).
      if (destination) {
        L.circleMarker([destination.latitude, destination.longitude], {
          radius: 7,
          color: '#0f1f17',
          weight: 3,
          fillColor: '#ffffff',
          fillOpacity: 1,
        })
          .addTo(instance)
          .bindTooltip('Votre destination', { permanent: false });
      }

      const limites: [number, number][] = destination
        ? [[destination.latitude, destination.longitude]]
        : [];

      for (const zone of zones) {
        const actif = choisi === zone.reference;
        L.circle([zone.latitude, zone.longitude], {
          radius: RAYON_DE_LA_ZONE_METRES,
          color: '#017628',
          weight: actif ? 3 : 2,
          opacity: actif ? 0.9 : 0.55,
          fillColor: '#017628',
          fillOpacity: actif ? 0.22 : 0.14,
        })
          .addTo(instance)
          .bindTooltip(`${zone.nom} · ${zone.distance}`, { direction: 'top' });
        limites.push([zone.latitude, zone.longitude]);
      }

      if (limites.length > 1) {
        instance.fitBounds(L.latLngBounds(limites).pad(0.25));
      }
    });

    return () => {
      vivant = false;
      instance?.remove();
      carte.current = null;
    };
  }, [zones, destination, choisi, satellite]);

  return (
    <div
      ref={conteneur}
      className="carte-osm"
      role="application"
      aria-label={`Carte : ${zones.length} zone${zones.length > 1 ? 's' : ''} approximative${zones.length > 1 ? 's' : ''} de Bike Sitters`}
    />
  );
}

import { useEffect, useState } from 'react';
import { playerService } from '../services/PlayerService';
import RealmsPanel from '../components/RealmsPanel';
import ResourcesPanel from '../components/ResourcesPanel';
import FactoriesPanel from '../components/FactoriesPanel';
import SkillsPanel from '../components/SkillsPanel';
import EventsPanel from '../components/EventsPanel';
import Toast from '../components/Toast';
import GameHeader from '../components/GameHeader';

const REFRESH_INTERVAL_MS = 1000; // 1s
const MAX_EVENTS = 20;

function GamePage({ onLogout }) {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [upgradingFactoryId, setUpgradingFactoryId] = useState(null);
    const [unlockingRealmCode, setUnlockingRealmCode] = useState(null);
    const [activatingRealmId, setActivatingRealmId] = useState(null);
    const [upgradingSkillId, setUpgradingSkillId] = useState(null);
    const [toast, setToast] = useState(null);
    const [events, setEvents] = useState([]);
    const [idleGainsModal, setIdleGainsModal] = useState(null);

    // Chargement initial
    useEffect(() => {
        setLoading(true);
        setError('');
        playerService
            .getProfile()
            .then((res) => {
                const data = res.data;
                setProfile(data);

                // Affichage des gains IDLE dans un modal
                if (
                    data.idleGains &&
                    data.idleGains.secondsOffline > 0 &&
                    Array.isArray(data.idleGains.resources) &&
                    data.idleGains.resources.length > 0
                ) {
                    const seconds = Math.round(data.idleGains.secondsOffline || 0);

                    setIdleGainsModal({
                        seconds,
                        resources: data.idleGains.resources,
                    });

                    data.idleGains.resources.forEach((r) => {
                        const amount = Math.round(r.amount || 0).toLocaleString('fr-FR');
                        const name = r.name || r.code || 'ressource';
                        pushEvent(`Gains IDLE : +${amount} ${name}`);
                    });
                }
            })
            .catch((err) => {
                console.error(err);
                setError(
                    err.response?.data?.message || 'Erreur de chargement du profil'
                );
            })
            .finally(() => setLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Refresh idle toutes les X secondes
    useEffect(() => {
        const intervalId = setInterval(() => {
            playerService
                .getProfile()
                .then((res) => setProfile(res.data))
                .catch((err) => {
                    console.error('Erreur refresh idle:', err);
                });
        }, REFRESH_INTERVAL_MS);

        return () => clearInterval(intervalId);
    }, []);

    // Auto-hide du toast
    useEffect(() => {
        if (!toast) return;
        const id = setTimeout(() => setToast(null), 3000);
        return () => clearTimeout(id);
    }, [toast]);

    const refreshProfile = async () => {
        const res = await playerService.getProfile();
        setProfile(res.data);
    };

    const pushEvent = (message) => {
        setEvents((prev) => {
            const next = [{ id: Date.now(), message }, ...prev];
            return next.slice(0, MAX_EVENTS);
        });
    };

    const showSuccess = (message) => {
        setToast({ type: 'success', message });
    };

    const showError = (message) => {
        setToast({ type: 'error', message });
    };

    const handleUpgradeFactory = async (factoryId) => {
        if (!factoryId) return;
        setUpgradingFactoryId(factoryId);

        try {
            const res = await playerService.upgradeFactory(factoryId);
            const data = res.data;
            await refreshProfile();
            showSuccess(data.message || 'Usine améliorée');
            pushEvent(
                `Usine #${factoryId} montée au niveau ${
                    data.newLevel ?? '?'
                } (coût ${Math.round(data.cost ?? 0).toLocaleString('fr-FR')}).`
            );
        } catch (err) {
            console.error(err);
            showError(
                err.response?.data?.message ||
                    "Erreur lors de l'amélioration de l'usine"
            );
        } finally {
            setUpgradingFactoryId(null);
        }
    };

    const handleUnlockRealm = async (realmCode) => {
        if (!realmCode) return;
        setUnlockingRealmCode(realmCode);

        try {
            const res = await playerService.unlockRealm(realmCode);
            const data = res.data;
            await refreshProfile();

            if (data.alreadyUnlocked) {
                showSuccess('Royaume déjà débloqué.');
                pushEvent(`Royaume ${realmCode} déjà débloqué.`);
            } else {
                showSuccess('Royaume débloqué.');
                pushEvent(`Royaume ${realmCode} vient d’être débloqué.`);
            }
        } catch (err) {
            console.error(err);
            showError(
                err.response?.data?.message ||
                    'Erreur lors du déblocage du royaume'
            );
        } finally {
            setUnlockingRealmCode(null);
        }
    };

    const handleActivateRealm = async (realmId) => {
        if (!realmId) return;
        setActivatingRealmId(realmId);

        try {
            const res = await playerService.activateRealm(realmId);
            const data = res.data;
            await refreshProfile();
            showSuccess(data.message || 'Royaume activé');
            pushEvent(`Royaume #${realmId} activé.`);
        } catch (err) {
            console.error(err);
            showError(
                err.response?.data?.message ||
                    "Erreur lors de l'activation du royaume"
            );
        } finally {
            setActivatingRealmId(null);
        }
    };

    const handleUpgradeSkill = async (skillId) => {
        if (!skillId) return;
        setUpgradingSkillId(skillId);

        try {
            const res = await playerService.upgradeSkill(skillId);
            const data = res.data;
            await refreshProfile();
            showSuccess(data.message || 'Compétence améliorée');
            pushEvent(
                `Compétence #${skillId} montée au niveau ${
                    data.newLevel ?? '?'
                } (coût ${Math.round(data.cost ?? 0).toLocaleString('fr-FR')}).`
            );
        } catch (err) {
            console.error(err);
            showError(
                err.response?.data?.message ||
                    "Erreur lors de l'amélioration de la compétence"
            );
        } finally {
            setUpgradingSkillId(null);
        }
    };

    if (loading)
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-amber-950 text-amber-100">
                <p className="text-xl animate-pulse">Chargement du forge-monde…</p>
            </div>
        );

    if (error)
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 text-red-400">
                {error}
            </div>
        );

    if (!profile)
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 text-amber-100">
                Profil introuvable.
            </div>
        );

    // Données du profil
    const { user, resources, factories, realms, stats, skills } = profile;

    // Royaume actif (ou celui débloqué par défaut)
    const activeRealm =
        realms?.find((r) => r.is_active) ||
        realms?.find((r) => r.is_default_unlocked) ||
        null;

    const activeRealmId = activeRealm?.realm_id ?? activeRealm?.realmId ?? null;
    const activeRealmCode = activeRealm?.code || 'ASHKAR';

    // Thème visuel par royaume
    const realmTheme = (() => {
    switch (activeRealmCode) {
        case 'AQUERUS':
            return {
                bg: 'from-slate-950 via-sky-950 to-cyan-900',
                modalBorder: 'border-cyan-400/50',
                modalTitle: 'text-cyan-300',
                modalButton: 'bg-cyan-500/90 hover:bg-cyan-400',
            };
        case 'ASHKAR':
        default:
            return {
                // plus chaud / orangé que ton ancien fond
                bg: 'from-black via-amber-950 to-orange-800',
                modalBorder: 'border-amber-500/60',
                modalTitle: 'text-amber-400',
                modalButton: 'bg-orange-500/90 hover:bg-orange-400',
            };
    }
})();


    // Usines visibles : globales (realm_id null) + royaume actif
    const visibleFactories =
        factories?.filter((f) => {
            const factoryRealmId = f.realm_id ?? f.realmId ?? null;

            if (factoryRealmId === null || factoryRealmId === undefined) return true;
            if (!activeRealmId) return true;

            return Number(factoryRealmId) === Number(activeRealmId);
        }) ?? factories;

    // Compétences visibles : globales + royaume actif
    const visibleSkills =
        skills?.filter((s) => {
            const skillRealmId = s.realm_id ?? s.realmId ?? null;

            if (skillRealmId === null || skillRealmId === undefined) return true;
            if (!activeRealmId) return true;

            return Number(skillRealmId) === Number(activeRealmId);
        }) ?? skills;

    // Ressources pour les usines visibles
    const usedResourceIds = new Set(
        (visibleFactories ?? []).map((f) => f.resource_id)
    );

    const visibleResources =
        resources?.filter((r) => usedResourceIds.has(r.resource_id)) ?? resources;

    // Ressources affichées dans le panneau : seulement si le royaume correspondant est débloqué
    const resourceRealmCode = (resource) => {
        switch (resource.code) {
            case 'CHARBON_GUERRE':
                return 'ASHKAR';
            case 'ESSENCE_ABYSSALE':
                return 'AQUERUS';
            default:
                return null;
        }
    };

    const unlockedRealmByCode = {};
    (realms || []).forEach((realm) => {
        const isUnlocked = realm.is_unlocked || realm.is_default_unlocked;
        if (isUnlocked) {
            unlockedRealmByCode[realm.code] = true;
        }
    });

    const displayResources =
        resources?.filter((r) => {
            const realmCode = resourceRealmCode(r);
            if (!realmCode) return true;
            return Boolean(unlockedRealmByCode[realmCode]);
        }) ?? resources;

    // Stats formatées pour le header
    const headerStats = (() => {
        if (!stats) return null;

        const maxRealmId = stats.max_realm_unlocked_id;
        let maxRealmName = null;

        if (maxRealmId && realms) {
            const realm = realms.find((r) => r.realm_id === maxRealmId);
            maxRealmName = realm?.name || null;
        }

        return {
            ...stats,
            login_count: stats.total_logins,
            max_realm_unlocked: maxRealmName,
        };
    })();

    return (
        <div
            className={`min-h-screen bg-gradient-to-b ${realmTheme.bg} text-slate-100 relative`}
        >
            <Toast toast={toast} />

            {idleGainsModal && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70">
                    <div
                        className={`bg-slate-900 border ${realmTheme.modalBorder} rounded-xl p-4 sm:p-6 max-w-md w-full mx-3 shadow-xl`}
                    >
                        <h2
                            className={`text-lg font-semibold mb-2 ${realmTheme.modalTitle}`}
                        >
                            Gains hors-ligne
                        </h2>

                        <p className="text-sm text-slate-200 mb-3">
                            Pendant ton absence ({idleGainsModal.seconds}s), tu as gagné :
                        </p>

                        <ul className="text-sm text-slate-100 space-y-1 mb-4 max-h-48 overflow-y-auto">
                            {idleGainsModal.resources.map((r) => {
                                const amount = Math.round(r.amount || 0).toLocaleString(
                                    'fr-FR'
                                );
                                const name = r.name || r.code || 'ressource';

                                return (
                                    <li key={r.resourceId || r.code || name}>
                                        <span className="font-mono text-amber-300">
                                            {amount}
                                        </span>{' '}
                                        {name}
                                    </li>
                                );
                            })}
                        </ul>

                        <button
                            type="button"
                            onClick={() => setIdleGainsModal(null)}
                            className={`mt-1 inline-flex items-center rounded-md ${realmTheme.modalButton} text-slate-900 text-xs sm:text-sm font-semibold px-4 py-2 transition-colors`}
                        >
                            OK, au travail !
                        </button>
                    </div>
                </div>
            )}

            <GameHeader user={user} stats={headerStats} onLogout={onLogout} />

            <main className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-10 space-y-4 sm:space-y-6 md:space-y-8">
                <RealmsPanel
                    realms={realms}
                    resources={resources}
                    unlockingRealmCode={unlockingRealmCode}
                    activatingRealmId={activatingRealmId}
                    onUnlockRealm={handleUnlockRealm}
                    onActivateRealm={handleActivateRealm}
                />

                <div className="grid gap-4 sm:gap-6 md:grid-cols-2 md:gap-8">
                    <ResourcesPanel resources={displayResources} />
                    <FactoriesPanel
                        factories={visibleFactories}
                        resources={visibleResources}
                        skills={visibleSkills}
                        upgradingFactoryId={upgradingFactoryId}
                        onUpgradeFactory={handleUpgradeFactory}
                    />
                </div>

                <SkillsPanel
                    skills={visibleSkills}
                    upgradingSkillId={upgradingSkillId}
                    onUpgradeSkill={handleUpgradeSkill}
                />

                <EventsPanel events={events} />
            </main>
        </div>
    );
}

export default GamePage;












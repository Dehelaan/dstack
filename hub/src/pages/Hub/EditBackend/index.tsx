import React from 'react';
import { Container, Header, Loader, ContentLayout } from 'components';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetHubQuery, useUpdateHubMutation } from 'services/hub';
import { useBreadcrumbs, useNotifications } from 'hooks';
import { ROUTES } from 'routes';
import { isRequestErrorWithDetail } from 'libs';
import { HubForm } from '../Form';

export const HubEditBackend: React.FC = () => {
    const { t } = useTranslation();
    const params = useParams();
    const paramHubName = params.name ?? '';
    const navigate = useNavigate();
    const [pushNotification] = useNotifications();
    const { data, isLoading } = useGetHubQuery({ name: paramHubName });
    const [updateHub, { isLoading: isHubUpdating }] = useUpdateHubMutation();

    useBreadcrumbs([
        {
            text: t('navigation.projects'),
            href: ROUTES.PROJECT.LIST,
        },
        {
            text: paramHubName,
            href: ROUTES.PROJECT.DETAILS.FORMAT(paramHubName),
        },

        {
            text: t('projects.edit.edit_backend'),
            href: ROUTES.USER.EDIT.FORMAT(paramHubName),
        },
    ]);

    const onCancelHandler = () => {
        navigate(ROUTES.PROJECT.DETAILS.FORMAT(paramHubName));
    };

    const onSubmitHandler = async (hubData: Partial<IHub>): Promise<IHub> => {
        const request = updateHub({
            ...hubData,
            hub_name: paramHubName,
        }).unwrap();

        try {
            const data = await request;

            pushNotification({
                type: 'success',
                content: t('projects.edit.success_notification'),
            });

            navigate(ROUTES.PROJECT.DETAILS.FORMAT(data.hub_name ?? paramHubName));
        } catch (e) {
            if (isRequestErrorWithDetail(e)) {
                pushNotification({
                    type: 'error',
                    content: `${t('projects.edit.error_notification')}: ${e.detail}`,
                });
            } else {
                pushNotification({
                    type: 'error',
                    content: t('projects.edit.error_notification'),
                });
            }
        }

        return request;
    };

    return (
        <ContentLayout header={<Header variant="awsui-h1-sticky">{paramHubName}</Header>}>
            {isLoading && !data && (
                <Container>
                    <Loader />
                </Container>
            )}

            {data && (
                <HubForm initialValues={data} loading={isHubUpdating} onSubmit={onSubmitHandler} onCancel={onCancelHandler} />
            )}
        </ContentLayout>
    );
};
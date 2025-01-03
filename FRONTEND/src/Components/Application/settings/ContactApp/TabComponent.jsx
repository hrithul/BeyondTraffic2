import React, { Fragment, useContext } from 'react';
import { TabContent, TabPane } from 'reactstrap';
import { FollowUp, Favourites, Ideas, Business, Holidays, Important } from '../../../../Constant';
import HistoryClass from './History';
import NoDataFoundClass from './NoDataFound';
import OrgenizationTab from './OrgenizationTab';
import PersonalTab from './PersonalTab';
import ContactAppContext from '../../../../_helper/Contact';
import StoreTab from './StoreTab';
import DeviceTab from './DeviceTab';
import UsersTab from './UsersTab';

const TabComponent = ({ activeTab }) => {
    const { users } = useContext(ContactAppContext);
    return (
        <Fragment>
            <TabContent activeTab={activeTab}>
                <TabPane tabId="1">
                    <PersonalTab activeTab={activeTab} />
                </TabPane>
                <TabPane tabId="2">
                    <OrgenizationTab />
                </TabPane>
                <TabPane tabId="3">
                    <StoreTab />
                </TabPane>
                <TabPane tabId="4">
                    <DeviceTab/>
                </TabPane>
                <TabPane tabId="5">
                    <UsersTab/>
                </TabPane>
                <TabPane tabId="6">
                    <NoDataFoundClass title={Important} />
                </TabPane>
                <TabPane tabId="7">
                    <NoDataFoundClass title={Business} />
                </TabPane>
                <TabPane tabId="8">
                    <NoDataFoundClass title={Holidays} />
                </TabPane>
                <HistoryClass />
            </TabContent>
        </Fragment>
    );
};

export default TabComponent;
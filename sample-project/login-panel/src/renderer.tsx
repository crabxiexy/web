import React from 'react'
import { render } from 'react-dom'
import { HashRouter, Route, Switch } from 'react-router-dom'
import { Main } from 'Pages/Main'
import { Login } from 'Pages/login'
import {root} from 'Pages/admin/root'
import {Rename} from 'Pages/rename'
import {Register} from 'Pages/register'
import { Dashboard } from 'Pages/student/dashboard'
import { RunUpload } from 'Pages/student/runupload'
import {TA_dashboard} from 'Pages/ta/ta_dashboard'
import {AssignTA} from 'Pages/ta/student_management'
import {RunningCheck} from 'Pages/ta/running_check'
import {CheckRecord} from 'Pages/student/checkrecord'
import {GroupexManagement} from 'Pages/ta/groupex_management'
import {Checkgroupex} from 'Pages/student/checkgroupex'
import {ViewClub} from 'Pages/student/viewclub'
import {UploadProfilePage} from 'Pages/UpdateProfile'
const Layout = () => {
    return (
        <HashRouter>
            <Switch>
                <Route path="/" exact component={Main} />
                <Route path="/login" exact component={Login} />
                <Route path="/admin/root" exact component={root} />
                <Route path="/rename" exact component={Rename} />
                <Route path="/register" exact component={Register} />
                <Route path="/student_dashboard" exact component={Dashboard} />
                <Route path="/student_runupload" exact component={RunUpload}/>
                <Route path="/ta_dashboard" exact component={TA_dashboard} />
                <Route path="/ta_student_management" exact component={AssignTA} />
                <Route path="/ta_running_check" exact component={RunningCheck} />
                <Route path="/student_check" exact component={CheckRecord} />
                <Route path="/groupex_management" exact component={GroupexManagement} />
                <Route path="/student_checkgroupex" exact component={Checkgroupex} />
                <Route path="/viewclub" exact component={ViewClub} />
                <Route path="/update_profile" exact component={UploadProfilePage} />


            </Switch>
        </HashRouter>
    )
}
render(<Layout />, document.getElementById('root'))

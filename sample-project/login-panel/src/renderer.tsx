import React from 'react'
import { render } from 'react-dom'
import { HashRouter, Route, Switch } from 'react-router-dom'
import { Main } from 'Pages/Main'
import { Login } from 'Pages/login'
import {root} from 'Pages/admin/root'
import {Rename} from 'Pages/rename'
import {Register} from 'Pages/register'
import { dashboard } from 'Pages/student/dashboard'
import { runupload } from 'Pages/student/runupload'
const Layout = () => {
    return (
        <HashRouter>
            <Switch>
                <Route path="/" exact component={Main} />
                <Route path="/login" exact component={Login} />
                <Route path="/admin/root" exact component={root} />
                <Route path="/rename" exact component={Rename} />
                <Route path="/register" exact component={Register} />
                <Route path="/student_dashboard" exact component={dashboard} />
                <Route path="/student_runupload" exact component={runupload}/>
            </Switch>
        </HashRouter>
    )
}
render(<Layout />, document.getElementById('root'))

import React from 'react'
import { render } from 'react-dom'
import { HashRouter, Route, Switch } from 'react-router-dom'
import { Main } from 'Pages/Main'
import { Login } from 'Pages/login'
import {root} from 'Pages/root'
import {rename} from 'Pages/rename'
import {Register} from 'Pages/register'
const Layout = () => {
    return (
        <HashRouter>
            <Switch>
                <Route path="/" exact component={Main} />
                <Route path="/login" exact component={Login} />
                <Route path="/root" exact component={root} />
                <Route path="/rename" exact component={rename} />
                <Route path="/register" exact component={Register} />
            </Switch>
        </HashRouter>
    )
}
render(<Layout />, document.getElementById('root'))

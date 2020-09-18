/* Copyright (c) 2020 AutomaCoin*/

import * as d3 from "d3";
import { Terminal } from "xterm";
import { Spinner } from "spin.js";
import { SPINNEROPTS } from "../config/config"

function barChart(data) {
    const div = d3.create("div")
        .style("font", "10px sans-serif")
        .style("text-align", "right")
        .style("color", "white");

    div.selectAll("div")
        .data(data)
        .join("div")
        .style("background", "steelblue")
        .style("padding", "3px")
        .style("margin", "1px")
        .style("width", d => `${d * 10}px`)
        .text(d => d);

    return div.node();
}

export function ultimateQuestion() {
    return 43;
}

/* Components */
export function dashboardComponent() {
    return {
        expand: false,
        tab: "nodes",
        title: "Dashboard",
        terminal: new Terminal({
            cols: 38,
            rows: 10
        }),
        output: new Terminal({
            cols: 38,
            rows: 10
        }),
        problems: new Terminal({
            cols: 38,
            rows: 10
        }),

        init: function () {
            this.terminal.open(document.getElementById('terminal'));
            this.output.open(document.getElementById('output'));
            this.problems.open(document.getElementById('problems'));

            this.terminal.write('$ Hello from Terminal. Please Turn On the client.');
            this.output.write('$ Hello from Output. Please Turn On the client.');
            this.problems.write('$ Hello from Problems. Please Turn On the client.');
        },

        detach: function () {
            document.getElementById('terminalOverlay').appendChild(document.getElementById(this.tab))
            this[this.tab].resize(50, 30);

        },

        attach: function () {
            this[this.tab].resize(38, 10);
            document.getElementById('terminalHarbor').appendChild(document.getElementById(this.tab))
        }
    }
}

export function userProfileComponent() {
    return {

        onpic: false,
        isUnlocked: window.loggedIn,
        smodal: false,

        histogram: function () {
            document.querySelector('#histogram').appendChild(barChart([6, 10, 2]));
        },

        login: async function () {
            Spruce.store('wallet').logged = 'true'

            if (typeof window.zilPay !== 'undefined') {
                this.smodal = !this.smodal;
                const isConnect = await window.zilPay.wallet.connect();

                console.log('test')
                if (!window.zilPay.wallet.isEnable) {
                    alert('not connected')
                }

                //const { signature, message, publicKey } = await window.zilPay.wallet.sign('test');
                //console.log(signature, message, publicKey);

            } else {
                this.isUnlocked = false;
                return;
            }
        }
    }
}

export function optionsComponent() {
    return {
        spinner: null,

        tab: 'console',

        fetching: false,

        fetch: function () {

            this.fetching = true;
            const target = document.getElementById('spinner');
            this.spinner = new Spinner(SPINNEROPTS).spin(target);
            setInterval(() => {
                this.spinner.stop();
                this.spinner = null;
                this.fetching = false;
            }, 3500)
        }
    }
}
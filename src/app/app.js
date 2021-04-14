/* Copyright (c) 2020 AutomaCoin*/

import { Terminal } from "xterm";
import { Spinner } from "spin.js";
import { SPINNEROPTS, MESSAGE } from "../config/config";
import { toast } from 'bulma-toast';
import PubSub from 'pubsub-js';

export function ultimateQuestion() {
    return 43;
}

/* Components */

export function dashboardComponent() {
    return {
        expand: false,
        tab: "terminal",
        title: "Dashboard",
        terminal: new Terminal({
            cols: 32,
            rows: 10
        }),
        output: new Terminal({
            cols: 32,
            rows: 10
        }),
        problems: new Terminal({
            cols: 32,
            rows: 10
        }),

        subscription: function (c) {
            let that = this;
            let sub;
            switch (c) {
                case 0:
                    sub = (msg, data) => that.terminal.writeln(`$ ${data}`);
                    break;
                case 1:
                    sub = (msg, data) => that.problems.writeln(`$ ${data}`);
                    break;
                case 2:
                    sub = (msg, data) => that.output.writeln(`$ ${data}`);
                    break;
                default:
                    sub = (msg, data) => console.log(`$ ${data}`);
            }
            return sub;
        },

        init: function () {

            Spruce.watch('wallet.logged', logged => {
                this.tab = 'terminal';
            });

            this.tokenOutput = PubSub.subscribe('OUTPUT', this.subscription(2));
            this.tokenTerminal = PubSub.subscribe('TERMINAL', this.subscription(0));
            this.tokenProblems = PubSub.subscribe('PROBLEMS', this.subscription(1));

            this.terminal.open(document.getElementById('terminal'));
            this.output.open(document.getElementById('output'));
            this.problems.open(document.getElementById('problems'));

            this.terminal.writeln('$ Terminal ready.');
            this.output.writeln('$ Output ready.');
            this.problems.writeln('$ Problems ready.');
        },

        clearBuff: function (buff) {
            this[buff].clear();
        },

        detach: function () {
            document.getElementById('terminalOverlay').appendChild(document.getElementById(this.tab))
            this[this.tab].resize(80, 30);

        },

        attach: function () {
            this[this.tab].resize(32, 10);
            document.getElementById('terminalHarbor').appendChild(document.getElementById(this.tab))
        }
    }
}

export function userProfileComponent() {
    return {

        modalShow: false,
        logged: false,
        isSigning: false,

        balance: async function () {
            const response = await harvester.account(window.zilPay.wallet.defaultAccount.base16, Spruce.store('wallet').nonce, '');
            Spruce.store('wallet').nonce = response.nonce;
            Spruce.store('wallet').balance = response.automacoin;
        },

        login: async function () {

            if (typeof window.zilPay !== 'undefined') {
                const isConnect = await window.zilPay.wallet.connect();
                if (isConnect) {

                    this.isSigning = true;
                    try {
                        const signature = await window.zilPay.wallet.sign('I\'m logging in');

                        const response = await harvester.account(window.zilPay.wallet.defaultAccount.base16, Spruce.store('wallet').nonce, signature);

                        if (response.client) {
                            this.logged = true;
                            this.isSigning = false;
                            Spruce.store('wallet').nonce = response.nonce;
                            Spruce.store('wallet').balance = response.automacoin;
                            Spruce.store('wallet').logged = this.logged.toString();
                            Spruce.store('wallet').account = window.zilPay.wallet.defaultAccount.base16;

                            toast({
                                message: "Welcome on board!",
                                type: "is-success",
                                duration: 1250,
                                dismissible: true,
                                animate: { in: "fadeIn", out: "fadeOut" }
                            });
                        }

                    } catch (e) {
                        PubSub.publish('PROBLEMS', 'User refused to sign login message.');
                        this.logged = false;
                        throw new Error(e);
                    } finally {
                        this.isSigning = false;
                    }

                } else {

                    PubSub.publish('PROBLEMS', 'User refused to connect wallet.');
                    throw new Error('user not connected');
                }


            } else {
                this.modalShow = !this.modalShow;
            }


        }
    }
}

export function optionsComponent() {

    return {

        spinner: null,

        tab: 'console',

        workunit: null,

        control: 'Idle.',

        init: function () {
            this.spinner = new Spinner(SPINNEROPTS)
        },

        go: async function () {

            const control = document.getElementById('engineControl');
            if (control.checked == true) {

                const target = document.getElementById('spinner');
                this.spinner.spin(target);

                this.control = "Running.";
                toast({
                    message: "Engine Started!",
                    type: "is-info",
                    duration: 1250,
                    dismissible: true,
                    animate: { in: "fadeIn", out: "fadeOut" }
                });

                while (document.getElementById('engineControl').checked === true) {
                    try {
                        await this.fetch();
                        await this.fire();
                    } catch (e) {
                        document.getElementById('engineControl').checked = false;
                        PubSub.publish('PROBLEMS', 'Problems during execution: ' + e.message);
                        this.spinner.stop()
                    }
                }

                PubSub.publish('PROBLEMS', 'Execution stopped by user.');
                this.spinner.stop();

            } else {
                toast({
                    message: "Execution stopped.",
                    type: "is-danger",
                    duration: 1000,
                    dismissible: true,
                    animate: { in: "fadeIn", out: "fadeOut" }
                });
                this.control = "Idle.";
            }

        },


        fire: async function () {
            try {
                PubSub.publish('TERMINAL', `Simulating machines from ${this.workunit.tm_set[0]} to ${this.workunit.tm_set[1]}.`);

                const tapes = await engine.ignite(this.workunit.states, this.workunit.colors, this.workunit.runtime, this.workunit.tm_set[0], this.workunit.tm_set[1]);

                PubSub.publish('OUTPUT', `The output of computation is stored in memory.`);
                PubSub.publish('TERMINAL', `Computation happened in  D(${this.workunit.colors}, ${this.workunit.states}).`);
                PubSub.publish('TERMINAL', `Submitting signed output of Workload with ID:${this.workunit.workload_ID} to Network.`);

                let { from, assigned, workload_ID, turing_machines } = this.workunit;
                await harvester.dispatch(from, assigned, workload_ID, turing_machines, tapes, 2, '');
                PubSub.publish('TERMINAL', 'Submission complete. Job is over, fetch new data.');
            } catch (error) {
                PubSub.publish('ERROR', error.message);
                throw new Error('Submission of tapes or something during computation went wrong.');
            }
        },

        fetch: async function () {

            try {

                PubSub.publish('TERMINAL', 'Fetching Turing Machines bricks.');

                this.workunit = await harvester.allocate(Spruce.store('wallet').account, Spruce.store('wallet').nonce, '');

                PubSub.publish('TERMINAL', 'Workload is in memory, ready to be done.');
            } catch (error) {
                PubSub.publish('ERROR', error.message);
                throw new Error('Error during fetch phase.');
            }

        }
    }
}
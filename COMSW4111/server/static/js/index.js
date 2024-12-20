'use strict';
const elem = React.createElement;


class Home extends React.Component {
    render() {
        return elem(
            'div',
            null,
            React.createElement(
                'div',
                {
                    className: "pt-5 pb-10 flex h-30",
                    style: {background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)"}
                },
                React.createElement(
                    "div",
                    {
                        className: "container mx-10 px-10 py-10"
                    },
                    React.createElement(
                        "h2",
                        {
                            className: "text-2xl font-bold mb-3 text-white"
                        },
                        "COMSW4111."
                    ),
                    React.createElement(
                        "h3",
                        {
                            className: "mt-4 text-lg mb-11 text-gray-200"
                        },
                        "Marketplace"
                    ),
                    React.createElement(
                        "div",
                        {
                            className: "my-15"
                        },
                        React.createElement(
                            "a",
                            {
                                className: "my-14 px-10 py-5 text-md font-bold tracking-wide text-center text-indigo-500  bg-white rounded-full hover:bg-blue-800 hover:text-white shadow-[1.0px_1.0px_5.0px_0.0px_rgba(0,0,0,0.58)] uppercase",
                                href: "/search"
                            },
                            "Search Listings"
                        )
                    )
                )
            )
        );
    }
}

const domContainer = document.querySelector('#root');
ReactDOM.render(elem(Home), domContainer);
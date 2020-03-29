var currentPage = 1;

var table = new Tabulator("#help_seekers_table", {
    layout: "fitColumns",
    placeholder: "Data Loading",
    autoResize: true,
    columns: [
        { title: "Name", field: "name", headerFilter: "input" },
        { title: "Email", field: "email", headerFilter: "input" },
        { title: "Phone", field: "phone", headerFilter: "number" },
        { title: "Help Category", field:"help_category.main", headerFilter: "input",},
        { title: "Help Item", field:"help_category.sub", headerFilter: "input"},
        { title: "Help Message", field: "help_message", formatter: "textarea", headerFilter: "input" },
        { title: "DateTime", field: "datetime", headerFilter: "input" },
    ],
    pagination: "local",
    paginationSize: 10,
});

function get_data() {
    var data = {};
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", "https://db-server-dot-corona-bot-gbakse.appspot.com/get_all_help_seekers", true);
    xmlhttp.onreadystatechange = function () {
        var currentPage = table.getPage()
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            data = JSON.parse(xmlhttp.responseText);
            table.setData(data); //change data
            table.setPage(Math.min(currentPage, table.getPageMax()));
        }
    };
    xmlhttp.send(null);
}
get_data();
setInterval(get_data, 5000);


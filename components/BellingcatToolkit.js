import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { DownloadIcon, FileTextIcon, MoonIcon, SunIcon } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

const TOOLS_URL = "https://raw.githubusercontent.com/bellingcat/toolkit/main/data/tools.json";
const EXTRA_TOOLS = [
  {
    name: "WHOIS Lookup",
    description: "Check domain registration info.",
    url: "https://whois.domaintools.com/",
    category: "Domain Investigation"
  },
  {
    name: "Shodan",
    description: "Search for devices connected to the internet.",
    url: "https://www.shodan.io/",
    category: "Network Intelligence"
  }
];

export default function BellingcatToolkit() {
  const [tools, setTools] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [filtered, setFiltered] = useState([]);
  const [selectedTool, setSelectedTool] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    fetch(TOOLS_URL)
      .then(res => res.json())
      .then(data => {
        const combined = [...data, ...EXTRA_TOOLS];
        setTools(combined);
        setFiltered(combined);
      });
  }, []);

  useEffect(() => {
    let result = tools;
    if (category !== "all") {
      result = result.filter(tool => tool.category === category);
    }
    if (search) {
      result = result.filter(tool =>
        tool.name.toLowerCase().includes(search.toLowerCase()) ||
        tool.description?.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFiltered(result);
  }, [search, category, tools]);

  const categories = [...new Set(tools.map(tool => tool.category))];

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filtered);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tools");
    XLSX.writeFile(workbook, "bellingcat_tools.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Bellingcat Tools List", 14, 16);
    const rows = filtered.map(tool => [tool.name, tool.description || "", tool.category || ""]);
    doc.autoTable({ head: [["Name", "Description", "Category"]], body: rows });
    doc.save("bellingcat_tools.pdf");
  };

  return (
    <div className={"p-6 space-y-6 " + (darkMode ? "dark bg-gray-900 text-white" : "bg-white text-black")}>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Bellingcat Toolkit</h1>
          <Input
            placeholder="Search tools..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />
        </div>
        <div className="flex flex-wrap gap-4 items-end">
          <Select onValueChange={setCategory} value={category}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat, idx) => (
                <SelectItem key={idx} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={exportToExcel} variant="secondary">
            <DownloadIcon className="mr-2 h-4 w-4" /> Export Excel
          </Button>
          <Button onClick={exportToPDF} variant="secondary">
            <FileTextIcon className="mr-2 h-4 w-4" /> Export PDF
          </Button>
          <div className="flex items-center gap-2">
            <Switch checked={darkMode} onCheckedChange={setDarkMode} />
            <Label>{darkMode ? <MoonIcon className="w-4 h-4" /> : <SunIcon className="w-4 h-4" />}</Label>
          </div>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {filtered.map((tool, idx) => (
          <Card key={idx} className="shadow-lg">
            <CardContent className="p-4 space-y-2">
              <h2 className="text-xl font-semibold">{tool.name}</h2>
              <p className="text-sm text-muted-foreground">{tool.description}</p>
              <div className="flex justify-between items-center">
                {tool.url && (
                  <Button variant="outline" asChild>
                    <a href={tool.url} target="_blank" rel="noopener noreferrer">
                      Visit Tool
                    </a>
                  </Button>
                )}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button onClick={() => setSelectedTool(tool)} variant="ghost">Details</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{selectedTool?.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2">
                      <p><strong>Description:</strong> {selectedTool?.description}</p>
                      <p><strong>Category:</strong> {selectedTool?.category}</p>
                      {selectedTool?.url && (
                        <p><strong>Link:</strong> <a href={selectedTool.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{selectedTool.url}</a></p>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

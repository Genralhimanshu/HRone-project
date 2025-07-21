import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Copy,
  Code2,
  Layers3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";

export type FieldType = "string" | "number" | "boolean" | "object" | "array";

export interface SchemaField {
  id: string;
  name: string;
  type: FieldType;
  required: boolean;
  description?: string;
  properties?: SchemaField[];
  items?: SchemaField;
}

interface FieldEditorProps {
  field: SchemaField;
  onUpdate: (field: SchemaField) => void;
  onDelete: () => void;
  depth: number;
}

const FieldEditor: React.FC<FieldEditorProps> = ({
  field,
  onUpdate,
  onDelete,
  depth,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const updateField = useCallback(
    (updates: Partial<SchemaField>) => {
      onUpdate({ ...field, ...updates });
    },
    [field, onUpdate],
  );

  const addProperty = () => {
    const newProperty: SchemaField = {
      id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: "newField",
      type: "string",
      required: false,
    };
    updateField({
      properties: [...(field.properties || []), newProperty],
    });
  };

  const updateProperty = (index: number, updatedProperty: SchemaField) => {
    const newProperties = [...(field.properties || [])];
    newProperties[index] = updatedProperty;
    updateField({ properties: newProperties });
  };

  const deleteProperty = (index: number) => {
    const newProperties = field.properties?.filter((_, i) => i !== index) || [];
    updateField({ properties: newProperties });
  };

  const updateArrayItems = (updatedItems: SchemaField) => {
    updateField({ items: updatedItems });
  };

  const canHaveChildren = field.type === "object" || field.type === "array";
  const hasChildren = field.type === "object" && field.properties?.length > 0;

  const getTypeIcon = (type: FieldType) => {
    switch (type) {
      case "string":
        return "📝";
      case "number":
        return "🔢";
      case "boolean":
        return "☑️";
      case "object":
        return "📦";
      case "array":
        return "📋";
      default:
        return "📄";
    }
  };

  const getTypeColor = (type: FieldType) => {
    switch (type) {
      case "string":
        return "bg-green-100 text-green-800 border-green-200";
      case "number":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "boolean":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "object":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "array":
        return "bg-pink-100 text-pink-800 border-pink-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div
      className={cn(
        "border-2 rounded-xl p-4 space-y-4 bg-white shadow-sm hover:shadow-md transition-all duration-200",
        depth > 0 && "ml-6 border-l-4 border-l-blue-300 bg-blue-50/30",
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-3 flex-1">
          <GripVertical className="h-5 w-5 text-gray-400 cursor-grab hover:text-gray-600 transition-colors" />

          {canHaveChildren && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-7 w-7 p-0 hover:bg-blue-100"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          )}

          <div className="flex items-center gap-2">
            <span className="text-lg">{getTypeIcon(field.type)}</span>
            <Input
              value={field.name}
              onChange={(e) => updateField({ name: e.target.value })}
              placeholder="Field name"
              className="max-w-48 font-medium"
            />
          </div>

          <Select
            value={field.type}
            onValueChange={(value: FieldType) => {
              const updates: Partial<SchemaField> = { type: value };
              if (value === "object" && !field.properties) {
                updates.properties = [];
              }
              if (value === "array" && !field.items) {
                updates.items = {
                  id: `items_${Date.now()}`,
                  name: "item",
                  type: "string",
                  required: false,
                };
              }
              updateField(updates);
            }}
          >
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="string">📝 String</SelectItem>
              <SelectItem value="number">🔢 Number</SelectItem>
              <SelectItem value="boolean">☑️ Boolean</SelectItem>
              <SelectItem value="object">📦 Object</SelectItem>
              <SelectItem value="array">📋 Array</SelectItem>
            </SelectContent>
          </Select>

          <Badge
            variant={field.required ? "default" : "secondary"}
            className={cn(
              "cursor-pointer transition-all hover:scale-105",
              field.required
                ? "bg-red-100 text-red-800 hover:bg-red-200"
                : "hover:bg-gray-200",
            )}
            onClick={() => updateField({ required: !field.required })}
          >
            {field.required ? "Required" : "Optional"}
          </Badge>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <Input
        value={field.description || ""}
        onChange={(e) => updateField({ description: e.target.value })}
        placeholder="Description (optional)"
        className="text-sm"
      />

      {isExpanded && (
        <>
          {field.type === "object" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-700">
                  Properties
                </h4>
                <Button onClick={addProperty} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Property
                </Button>
              </div>
              {field.properties?.map((property, index) => (
                <FieldEditor
                  key={property.id}
                  field={property}
                  onUpdate={(updatedProperty) =>
                    updateProperty(index, updatedProperty)
                  }
                  onDelete={() => deleteProperty(index)}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}

          {field.type === "array" && field.items && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">
                Array Items Schema
              </h4>
              <FieldEditor
                field={field.items}
                onUpdate={updateArrayItems}
                onDelete={() => {}}
                depth={depth + 1}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default function Index() {
  const [schema, setSchema] = useState<SchemaField[]>([
    {
      id: "field_1",
      name: "name",
      type: "string",
      required: true,
      description: "The name of the user",
    },
    {
      id: "field_2",
      name: "age",
      type: "number",
      required: false,
      description: "The age of the user",
    },
  ]);

  const addField = () => {
    const newField: SchemaField = {
      id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: "newField",
      type: "string",
      required: false,
    };
    setSchema([...schema, newField]);
  };

  const updateField = (index: number, updatedField: SchemaField) => {
    const newSchema = [...schema];
    newSchema[index] = updatedField;
    setSchema(newSchema);
  };

  const deleteField = (index: number) => {
    setSchema(schema.filter((_, i) => i !== index));
  };

  const generateJsonSchema = () => {
    const convertField = (field: SchemaField): any => {
      const baseSchema: any = {
        type: field.type,
      };

      if (field.description) {
        baseSchema.description = field.description;
      }

      if (field.type === "object" && field.properties) {
        baseSchema.properties = {};
        const required: string[] = [];

        field.properties.forEach((prop) => {
          baseSchema.properties[prop.name] = convertField(prop);
          if (prop.required) {
            required.push(prop.name);
          }
        });

        if (required.length > 0) {
          baseSchema.required = required;
        }
      }

      if (field.type === "array" && field.items) {
        baseSchema.items = convertField(field.items);
      }

      return baseSchema;
    };

    const jsonSchema = {
      type: "object",
      properties: {},
      required: [] as string[],
    };

    schema.forEach((field) => {
      jsonSchema.properties[field.name] = convertField(field);
      if (field.required) {
        jsonSchema.required.push(field.name);
      }
    });

    if (jsonSchema.required.length === 0) {
      delete jsonSchema.required;
    }

    return jsonSchema;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(
      JSON.stringify(generateJsonSchema(), null, 2),
    );
    toast({
      title: "Copied!",
      description: "JSON schema copied to clipboard",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto p-6">
        <div className="mb-10 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-xl">
              <Code2 className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Schema Builder
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Design and generate JSON schemas visually with nested objects,
            arrays, and real-time preview
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Schema Editor */}
          <Card className="h-fit shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <Layers3 className="h-5 w-5" />
                  Schema Definition
                  <Badge
                    variant="secondary"
                    className="bg-white/20 text-white border-white/30"
                  >
                    {schema.length} fields
                  </Badge>
                </CardTitle>
                <Button
                  onClick={addField}
                  size="sm"
                  variant="secondary"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Field
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {schema.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Code2 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No fields defined yet</p>
                  <p className="text-sm">
                    Click "Add Field" to start building your schema
                  </p>
                </div>
              ) : (
                schema.map((field, index) => (
                  <FieldEditor
                    key={field.id}
                    field={field}
                    onUpdate={(updatedField) =>
                      updateField(index, updatedField)
                    }
                    onDelete={() => deleteField(index)}
                    depth={0}
                  />
                ))
              )}
            </CardContent>
          </Card>

          {/* JSON Output */}
          <Card className="h-fit shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-t-lg">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <Copy className="h-5 w-5" />
                  Generated JSON Schema
                </CardTitle>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={copyToClipboard}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Textarea
                value={JSON.stringify(generateJsonSchema(), null, 2)}
                readOnly
                className="font-mono text-sm min-h-[70vh] resize-none border-0 rounded-none bg-gray-900 text-green-400 p-6"
                style={{ fontFamily: "JetBrains Mono, Consolas, monospace" }}
              />
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Built with React, TypeScript, and ShadCN UI
          </p>
        </div>
      </div>
    </div>
  );
}
